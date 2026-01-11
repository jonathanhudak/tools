// Recurring command - manage recurring payments and subscriptions

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { format } from 'date-fns';
import {
  getDatabase,
  getTransactions,
  getAllRecurringPayments,
  getActiveRecurringPayments,
  createRecurringPayment,
  updateRecurringPaymentStatus,
} from '../core/database.js';
import { getDatabasePath, ensureDataDir } from '../core/config.js';
import { detectRecurringPayments, formatFrequency, getFrequencyMultiplier } from '../recurring/detector.js';
import type { RecurringPayment } from '../core/types.js';

export function createRecurringCommand(): Command {
  const cmd = new Command('recurring')
    .description('Manage recurring payments and subscriptions');

  cmd
    .command('list')
    .description('List all recurring payments')
    .option('--active', 'Show only active subscriptions')
    .option('--inactive', 'Show only inactive subscriptions')
    .action(async (options) => {
      await listRecurring(options);
    });

  cmd
    .command('detect')
    .description('Detect recurring payments from transaction history')
    .option('-y, --year <year>', 'Year to analyze', String(new Date().getFullYear()))
    .option('--save', 'Save detected recurring payments to database')
    .action(async (options) => {
      await detectRecurring(options);
    });

  cmd
    .command('deactivate <merchant>')
    .description('Mark a subscription as inactive')
    .action(async (merchant: string) => {
      await deactivateRecurring(merchant);
    });

  cmd
    .command('add')
    .description('Manually add a recurring payment')
    .option('-m, --merchant <name>', 'Merchant name')
    .option('-a, --amount <amount>', 'Expected amount')
    .option('-f, --frequency <freq>', 'Frequency: weekly, biweekly, monthly, quarterly, yearly', 'monthly')
    .action(async (options) => {
      await addRecurring(options);
    });

  return cmd;
}

async function listRecurring(options: { active?: boolean; inactive?: boolean }): Promise<void> {
  ensureDataDir();
  const db = getDatabase(getDatabasePath());

  let payments = getAllRecurringPayments(db);

  if (options.active) {
    payments = payments.filter((p) => p.isActive);
  } else if (options.inactive) {
    payments = payments.filter((p) => !p.isActive);
  }

  if (payments.length === 0) {
    console.log(chalk.yellow('\nNo recurring payments found.'));
    console.log(chalk.dim('Run "finance recurring detect" to find recurring payments.\n'));
    return;
  }

  console.log(chalk.bold('\nRecurring Payments:\n'));

  // Group by active/inactive
  const active = payments.filter((p) => p.isActive);
  const inactive = payments.filter((p) => !p.isActive);

  if (active.length > 0) {
    console.log(chalk.green.bold('Active Subscriptions'));
    console.log('─'.repeat(80));
    printPaymentsTable(active);

    const monthlyTotal = active.reduce(
      (sum, p) => sum + (p.expectedAmount ?? 0) / (12 / getFrequencyMultiplier(p.frequency)),
      0
    );
    const yearlyTotal = active.reduce(
      (sum, p) => sum + (p.expectedAmount ?? 0) * getFrequencyMultiplier(p.frequency),
      0
    );

    console.log();
    console.log(chalk.bold(`Monthly Total: $${monthlyTotal.toFixed(2)}`));
    console.log(chalk.bold(`Yearly Total: $${yearlyTotal.toFixed(2)}`));
  }

  if (inactive.length > 0) {
    console.log();
    console.log(chalk.yellow.bold('Inactive / Cancelled'));
    console.log('─'.repeat(80));
    printPaymentsTable(inactive);
  }

  console.log();
}

function printPaymentsTable(payments: RecurringPayment[]): void {
  for (const p of payments) {
    const amount = p.expectedAmount ? `$${p.expectedAmount.toFixed(2)}` : 'varies';
    const frequency = formatFrequency(p.frequency);
    const yearly = p.expectedAmount
      ? `$${(p.expectedAmount * getFrequencyMultiplier(p.frequency)).toFixed(2)}/yr`
      : '';
    const lastSeen = p.lastSeen ? format(p.lastSeen, 'yyyy-MM-dd') : 'unknown';
    const status = p.status === 'keep' ? chalk.green('keep') :
                   p.status === 'cancel' ? chalk.red('cancel') :
                   chalk.yellow('review');

    console.log(
      `  ${p.merchant.padEnd(25)} ${amount.padStart(10)} ${frequency.padEnd(10)} ${yearly.padStart(12)}  ${status}  ${chalk.dim(lastSeen)}`
    );
  }
}

async function detectRecurring(options: { year?: string; save?: boolean }): Promise<void> {
  ensureDataDir();
  const db = getDatabase(getDatabasePath());

  const year = parseInt(options.year ?? String(new Date().getFullYear()), 10);

  const spinner = ora(`Analyzing transactions from ${year}...`).start();

  // Get transactions for the year
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);
  const transactions = getTransactions(db, { from: startDate, to: endDate, limit: 50000 });

  if (transactions.length === 0) {
    spinner.fail('No transactions found for this year.');
    return;
  }

  spinner.text = `Found ${transactions.length} transactions. Detecting patterns...`;

  // Detect recurring payments
  const detected = detectRecurringPayments(transactions);

  spinner.succeed(`Found ${detected.length} potential recurring payments.`);

  if (detected.length === 0) {
    console.log(chalk.yellow('\nNo recurring payment patterns detected.'));
    return;
  }

  console.log(chalk.bold('\nDetected Recurring Payments:\n'));
  console.log('─'.repeat(100));
  console.log(
    chalk.bold(
      'Merchant'.padEnd(25) +
        'Avg'.padStart(10) +
        '  ' +
        'Frequency'.padEnd(10) +
        'Count'.padStart(6) +
        '  ' +
        'Total Spent'.padStart(12) +
        '  ' +
        'Confidence'.padStart(10) +
        '  ' +
        'Active'
    )
  );
  console.log('─'.repeat(100));

  for (const r of detected) {
    const avgAmount = `$${r.averageAmount.toFixed(2)}`;
    const frequency = formatFrequency(r.frequency);
    const totalSpent = `$${r.totalSpent.toFixed(2)}`;
    const occurrences = `${r.occurrences}x`;
    const confidence = `${(r.confidence * 100).toFixed(0)}%`;
    const active = r.isActive ? chalk.green('Yes') : chalk.yellow('No');

    console.log(
      `${r.merchant.slice(0, 24).padEnd(25)}${avgAmount.padStart(10)}  ${frequency.padEnd(10)}${occurrences.padStart(6)}  ${totalSpent.padStart(12)}  ${confidence.padStart(10)}  ${active}`
    );
  }

  console.log('─'.repeat(100));

  // Calculate totals based on actual spending
  const activePayments = detected.filter((r) => r.isActive);
  const totalActualSpent = detected.reduce((sum, r) => sum + r.totalSpent, 0);
  const activeActualSpent = activePayments.reduce((sum, r) => sum + r.totalSpent, 0);
  const totalOccurrences = detected.reduce((sum, r) => sum + r.occurrences, 0);

  console.log();
  console.log(chalk.bold(`Total Recurring Patterns: ${detected.length}`));
  console.log(chalk.bold(`Active Subscriptions: ${activePayments.length}`));
  console.log(chalk.bold(`Total Transactions: ${totalOccurrences}`));
  console.log(chalk.bold(`Total Spent (All): $${totalActualSpent.toFixed(2)}`));
  console.log(chalk.bold(`Total Spent (Active): $${activeActualSpent.toFixed(2)}`));

  // Save if requested
  if (options.save) {
    console.log();
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Save these recurring payments to the database?',
        default: true,
      },
    ]);

    if (confirm) {
      let saved = 0;
      for (const r of detected) {
        // Check if already exists
        const existing = getAllRecurringPayments(db).find(
          (p) => p.merchant.toLowerCase() === r.merchant.toLowerCase()
        );
        if (!existing) {
          createRecurringPayment(db, {
            merchant: r.merchant,
            normalizedMerchant: null,
            categoryId: null,
            frequency: r.frequency,
            expectedAmount: r.averageAmount,
            amountVariance: r.amountVariance,
            isActive: r.isActive,
            lastSeen: r.lastSeen,
            nextExpected: r.nextExpected,
            notes: null,
            status: 'review',
          });
          saved++;
        }
      }
      console.log(chalk.green(`Saved ${saved} new recurring payments.`));
    }
  }

  console.log();
}

async function deactivateRecurring(merchant: string): Promise<void> {
  ensureDataDir();
  const db = getDatabase(getDatabasePath());

  const payments = getAllRecurringPayments(db);
  const payment = payments.find(
    (p) => p.merchant.toLowerCase().includes(merchant.toLowerCase())
  );

  if (!payment) {
    console.error(chalk.red(`No recurring payment found matching: ${merchant}`));
    process.exit(1);
  }

  updateRecurringPaymentStatus(db, payment.id, false);
  console.log(chalk.green(`Marked "${payment.merchant}" as inactive.`));
}

async function addRecurring(options: {
  merchant?: string;
  amount?: string;
  frequency?: string;
}): Promise<void> {
  ensureDataDir();
  const db = getDatabase(getDatabasePath());

  // Prompt for missing options
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'merchant',
      message: 'Merchant name:',
      when: !options.merchant,
    },
    {
      type: 'input',
      name: 'amount',
      message: 'Expected amount:',
      when: !options.amount,
      validate: (input: string) => !isNaN(parseFloat(input)) || 'Please enter a valid number',
    },
    {
      type: 'list',
      name: 'frequency',
      message: 'Frequency:',
      choices: ['weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'],
      when: !options.frequency,
    },
  ]);

  const merchant = options.merchant ?? answers.merchant;
  const amount = parseFloat(options.amount ?? answers.amount);
  const frequency = (options.frequency ?? answers.frequency) as RecurringPayment['frequency'];

  createRecurringPayment(db, {
    merchant,
    normalizedMerchant: null,
    categoryId: null,
    frequency,
    expectedAmount: amount,
    amountVariance: 0,
    isActive: true,
    lastSeen: new Date(),
    nextExpected: null,
    notes: null,
    status: 'keep',
  });

  console.log(chalk.green(`Added recurring payment: ${merchant} ($${amount.toFixed(2)} ${frequency})`));
}
