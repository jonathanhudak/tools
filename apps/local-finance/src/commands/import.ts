// Import command - import transactions from CSV

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import path from 'path';
import fs from 'fs';
import type Database from 'better-sqlite3';
import { parseCSVFile, generateImportHash } from '../import/csv-parser.js';
import { getAllSupportedBanks } from '../import/bank-detector.js';
import { getProfileById, ALL_PROFILES } from '../import/profiles/index.js';
import {
  getDatabase,
  createAccount,
  getAccountByName,
  getAllAccounts,
  insertTransaction,
  transactionExists,
  createImport,
} from '../core/database.js';
import { getDatabasePath, ensureDataDir } from '../core/config.js';

export function createImportCommand(): Command {
  const cmd = new Command('import')
    .description('Import transactions from a CSV file')
    .argument('[file]', 'Path to the CSV file')
    .option('-b, --bank <profile>', 'Bank profile ID (e.g., chase, bofa, schwab)')
    .option('-a, --account <name>', 'Account name (will be created if not exists)')
    .option('-t, --type <type>', 'Account type: checking, savings, credit, brokerage', 'checking')
    .option('--dry-run', 'Preview import without saving')
    .option('--list-banks', 'List all supported bank profiles')
    .action(async (file: string | undefined, options) => {
      if (options.listBanks) {
        console.log(chalk.bold('\nSupported Bank Profiles:\n'));
        for (const profile of ALL_PROFILES) {
          console.log(`  ${chalk.cyan(profile.id.padEnd(20))} ${profile.name}`);
        }
        console.log('\nUse with: finance import file.csv --bank=<profile-id>\n');
        return;
      }

      if (!file) {
        console.error(chalk.red('Error: Please provide a CSV file path.'));
        console.log('Usage: finance import <file.csv>');
        process.exit(1);
      }

      await runImport(file, options);
    });

  return cmd;
}

async function runImport(
  file: string,
  options: {
    bank?: string;
    account?: string;
    type?: string;
    dryRun?: boolean;
  }
): Promise<void> {
  // Check file exists
  const filePath = path.resolve(file);
  if (!fs.existsSync(filePath)) {
    console.error(chalk.red(`Error: File not found: ${filePath}`));
    process.exit(1);
  }

  const spinner = ora('Parsing CSV file...').start();

  // Parse the CSV
  const parseResult = parseCSVFile(filePath, {
    bankProfileId: options.bank,
  });

  if (parseResult.errors.length > 0 && parseResult.transactions.length === 0) {
    spinner.fail('Failed to parse CSV');
    for (const error of parseResult.errors) {
      console.error(chalk.red(`  ${error}`));
    }
    process.exit(1);
  }

  spinner.succeed(
    `Parsed ${parseResult.transactions.length} transactions` +
      (parseResult.detectedProfile ? ` (detected: ${parseResult.detectedProfile.name})` : '')
  );

  if (parseResult.errors.length > 0) {
    console.log(chalk.yellow(`\nWarnings (${parseResult.errors.length}):`));
    for (const error of parseResult.errors.slice(0, 5)) {
      console.log(chalk.yellow(`  ${error}`));
    }
    if (parseResult.errors.length > 5) {
      console.log(chalk.yellow(`  ... and ${parseResult.errors.length - 5} more`));
    }
  }

  if (parseResult.transactions.length === 0) {
    console.log(chalk.yellow('\nNo transactions to import.'));
    return;
  }

  // Show preview
  console.log(chalk.bold('\nPreview (first 5 transactions):'));
  console.log('─'.repeat(80));

  const preview = parseResult.transactions.slice(0, 5);
  for (const tx of preview) {
    const dateStr = tx.date.toISOString().split('T')[0];
    const amountStr = tx.amount >= 0
      ? chalk.green(`+$${tx.amount.toFixed(2)}`)
      : chalk.red(`-$${Math.abs(tx.amount).toFixed(2)}`);
    console.log(`  ${dateStr}  ${amountStr.padStart(15)}  ${tx.description.slice(0, 50)}`);
  }

  if (parseResult.transactions.length > 5) {
    console.log(chalk.dim(`  ... and ${parseResult.transactions.length - 5} more`));
  }

  console.log('─'.repeat(80));

  // Dry run stops here
  if (options.dryRun) {
    console.log(chalk.cyan('\nDry run complete. No changes made.'));
    return;
  }

  // Get or create account
  ensureDataDir();
  const db = getDatabase(getDatabasePath());

  let accountName = options.account;
  if (!accountName) {
    // Prompt for account name
    const existingAccounts = getAllAccounts(db);

    if (existingAccounts.length > 0) {
      const { choice } = await inquirer.prompt([
        {
          type: 'list',
          name: 'choice',
          message: 'Select an account:',
          choices: [
            ...existingAccounts.map((a) => ({ name: `${a.name} (${a.institution})`, value: a.name })),
            { name: '+ Create new account', value: '__new__' },
          ],
        },
      ]);

      if (choice === '__new__') {
        accountName = await promptNewAccount();
      } else {
        accountName = choice;
      }
    } else {
      accountName = await promptNewAccount();
    }
  }

  async function promptNewAccount(): Promise<string> {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Account name:',
        default: parseResult.detectedProfile?.name ?? 'My Account',
      },
    ]);
    return answers.name;
  }

  // Get or create the account
  let account = getAccountByName(db, accountName);
  if (!account) {
    const institution = parseResult.detectedProfile?.id.split('-')[0] ?? 'unknown';
    const type = (options.type ?? 'checking') as 'checking' | 'savings' | 'credit' | 'brokerage';
    account = createAccount(db, accountName, institution, type);
    console.log(chalk.green(`\nCreated account: ${account.name}`));
  }

  // Import transactions
  const importSpinner = ora('Importing transactions...').start();

  let imported = 0;
  let skipped = 0;

  for (const tx of parseResult.transactions) {
    const importHash = generateImportHash(tx.date, tx.description, tx.amount, account.id);

    // Check for duplicates
    if (transactionExists(db, importHash)) {
      skipped++;
      continue;
    }

    insertTransaction(db, {
      accountId: account.id,
      date: tx.date,
      description: tx.description,
      normalizedMerchant: null,
      amount: tx.amount,
      categoryId: null,
      categorySource: null,
      categoryConfidence: null,
      isRecurring: false,
      recurringId: null,
      notes: null,
      rawCsvRow: JSON.stringify(tx.rawRow),
      importHash,
    });

    imported++;
  }

  // Record import
  createImport(db, {
    filename: path.basename(filePath),
    bankProfile: parseResult.detectedProfile?.id ?? null,
    accountId: account.id,
    rowCount: parseResult.totalRows,
    importedCount: imported,
    skippedCount: skipped,
  });

  importSpinner.succeed(`Imported ${imported} transactions (${skipped} duplicates skipped)`);

  console.log(chalk.green(`\nImport complete!`));
  console.log(chalk.dim(`Run 'finance categorize' to categorize transactions.`));
}
