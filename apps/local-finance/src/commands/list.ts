// List command - view and search transactions

import { Command } from 'commander';
import chalk from 'chalk';
import { format } from 'date-fns';
import { getDatabase, getTransactions, getAllCategories, getAllAccounts } from '../core/database.js';
import { getDatabasePath, ensureDataDir } from '../core/config.js';
import type { Transaction } from '../core/types.js';

export function createListCommand(): Command {
  const cmd = new Command('list')
    .description('List and search transactions')
    .option('-f, --from <date>', 'Start date (YYYY-MM-DD)')
    .option('-t, --to <date>', 'End date (YYYY-MM-DD)')
    .option('-c, --category <id>', 'Filter by category ID')
    .option('-a, --account <name>', 'Filter by account name')
    .option('-s, --search <query>', 'Search in description')
    .option('-n, --limit <number>', 'Limit number of results', '50')
    .option('--format <type>', 'Output format: table, json, csv', 'table')
    .option('--uncategorized', 'Show only uncategorized transactions')
    .action(async (options) => {
      await runList(options);
    });

  return cmd;
}

async function runList(options: {
  from?: string;
  to?: string;
  category?: string;
  account?: string;
  search?: string;
  limit?: string;
  format?: string;
  uncategorized?: boolean;
}): Promise<void> {
  ensureDataDir();
  const db = getDatabase(getDatabasePath());

  // Get accounts for filtering
  const accounts = getAllAccounts(db);
  let accountId: string | undefined;

  if (options.account) {
    const account = accounts.find(
      (a) => a.name.toLowerCase() === options.account!.toLowerCase()
    );
    if (!account) {
      console.error(chalk.red(`Account not found: ${options.account}`));
      console.log('Available accounts:', accounts.map((a) => a.name).join(', '));
      process.exit(1);
    }
    accountId = account.id;
  }

  // Build query options
  const queryOptions: {
    accountId?: string;
    categoryId?: string;
    from?: Date;
    to?: Date;
    search?: string;
    limit?: number;
  } = {
    accountId,
    categoryId: options.uncategorized ? undefined : options.category,
    limit: parseInt(options.limit ?? '50', 10),
    search: options.search,
  };

  if (options.from) {
    queryOptions.from = new Date(options.from);
  }
  if (options.to) {
    queryOptions.to = new Date(options.to);
  }

  // Get transactions
  let transactions = getTransactions(db, queryOptions);

  // Filter uncategorized if requested
  if (options.uncategorized) {
    transactions = transactions.filter((t) => !t.categoryId);
  }

  if (transactions.length === 0) {
    console.log(chalk.yellow('No transactions found.'));
    return;
  }

  // Get categories for display
  const categories = getAllCategories(db);
  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const accountMap = new Map(accounts.map((a) => [a.id, a]));

  // Output based on format
  switch (options.format) {
    case 'json':
      outputJSON(transactions);
      break;
    case 'csv':
      outputCSV(transactions, categoryMap);
      break;
    default:
      outputTable(transactions, categoryMap, accountMap);
  }
}

function outputTable(
  transactions: Transaction[],
  categoryMap: Map<string, { id: string; name: string }>,
  accountMap: Map<string, { id: string; name: string }>
): void {
  console.log();
  console.log(
    chalk.bold(
      'Date'.padEnd(12) +
        'Amount'.padStart(12) +
        '  ' +
        'Category'.padEnd(20) +
        'Description'
    )
  );
  console.log('─'.repeat(100));

  for (const tx of transactions) {
    const dateStr = format(tx.date, 'yyyy-MM-dd');
    const amountStr =
      tx.amount >= 0
        ? chalk.green(`+$${tx.amount.toFixed(2)}`.padStart(12))
        : chalk.red(`-$${Math.abs(tx.amount).toFixed(2)}`.padStart(12));

    const category = tx.categoryId ? categoryMap.get(tx.categoryId) : null;
    const categoryStr = category ? category.name : chalk.dim('uncategorized');

    const desc = tx.normalizedMerchant || tx.description.slice(0, 40);

    console.log(
      `${dateStr.padEnd(12)}${amountStr}  ${categoryStr.padEnd(20)}${desc}`
    );
  }

  console.log('─'.repeat(100));
  console.log(chalk.dim(`Showing ${transactions.length} transactions`));
  console.log();
}

function outputJSON(transactions: Transaction[]): void {
  const output = transactions.map((tx) => ({
    id: tx.id,
    date: tx.date.toISOString().split('T')[0],
    description: tx.description,
    merchant: tx.normalizedMerchant,
    amount: tx.amount,
    category: tx.categoryId,
    accountId: tx.accountId,
  }));
  console.log(JSON.stringify(output, null, 2));
}

function outputCSV(
  transactions: Transaction[],
  categoryMap: Map<string, { id: string; name: string }>
): void {
  console.log('Date,Description,Amount,Category');
  for (const tx of transactions) {
    const dateStr = tx.date.toISOString().split('T')[0];
    const desc = `"${tx.description.replace(/"/g, '""')}"`;
    const category = tx.categoryId ? categoryMap.get(tx.categoryId)?.name ?? '' : '';
    console.log(`${dateStr},${desc},${tx.amount},${category}`);
  }
}
