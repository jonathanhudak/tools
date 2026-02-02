// List command - view trades

import { Command } from 'commander';
import chalk from 'chalk';
import Table from 'cli-table3';
import { format } from 'date-fns';
import { getDatabase, getTrades } from '../core/database.js';
import { getDatabasePath, ensureDataDir } from '../core/config.js';

export function createListCommand(): Command {
  const cmd = new Command('list')
    .description('List trades')
    .option('-s, --symbol <symbol>', 'Filter by symbol')
    .option('--side <side>', 'Filter by side: long or short')
    .option('--status <status>', 'Filter by status: open or closed', 'all')
    .option('-n, --limit <n>', 'Number of trades to show', '20')
    .option('--from <date>', 'Start date (YYYY-MM-DD)')
    .option('--to <date>', 'End date (YYYY-MM-DD)')
    .action(async (options) => {
      await listTrades(options);
    });

  return cmd;
}

async function listTrades(options: {
  symbol?: string;
  side?: string;
  status: string;
  limit: string;
  from?: string;
  to?: string;
}): Promise<void> {
  ensureDataDir();
  const db = getDatabase(getDatabasePath());

  const trades = getTrades(db, {
    symbol: options.symbol?.toUpperCase(),
    side: options.side as 'long' | 'short' | undefined,
    status: options.status === 'all' ? undefined : options.status as 'open' | 'closed',
    from: options.from ? new Date(options.from) : undefined,
    to: options.to ? new Date(options.to) : undefined,
    limit: parseInt(options.limit),
  });

  if (trades.length === 0) {
    console.log(chalk.yellow('\nNo trades found matching criteria.'));
    console.log(chalk.dim('Log trades with: trade log TSLA --side long --entry 280 --exit 285 --shares 100\n'));
    return;
  }

  console.log(chalk.bold(`\n📋 Trades (${trades.length}):\n`));

  const table = new Table({
    head: [
      chalk.bold('Date'),
      chalk.bold('Symbol'),
      chalk.bold('Side'),
      chalk.bold('Status'),
      chalk.bold('Entry'),
      chalk.bold('Exit'),
      chalk.bold('Qty'),
      chalk.bold('P&L'),
    ],
    colAligns: ['left', 'left', 'left', 'left', 'right', 'right', 'right', 'right'],
  });

  for (const trade of trades) {
    const sideColor = trade.side === 'long' ? chalk.green : chalk.red;
    const statusColor = trade.status === 'open' ? chalk.yellow : chalk.gray;
    const pnl = trade.pnl ?? 0;
    const pnlColor = pnl >= 0 ? chalk.green : chalk.red;

    table.push([
      format(trade.entryDate, 'yyyy-MM-dd'),
      chalk.cyan(trade.symbol),
      sideColor(trade.side.toUpperCase()),
      statusColor(trade.status.toUpperCase()),
      `$${trade.entryPrice.toFixed(2)}`,
      trade.exitPrice ? `$${trade.exitPrice.toFixed(2)}` : chalk.dim('-'),
      trade.entryQuantity.toString(),
      trade.status === 'closed' ? pnlColor(`$${pnl.toFixed(2)}`) : chalk.dim('-'),
    ]);
  }

  console.log(table.toString());
  console.log();
}
