// Log command - manually log a trade

import { Command } from 'commander';
import chalk from 'chalk';
import {
  getDatabase,
  insertTrade,
  updateTrade,
  getTrade,
  calculatePnL,
} from '../core/database.js';
import { getDatabasePath, ensureDataDir } from '../core/config.js';
import type { Trade } from '../core/types.js';

export function createLogCommand(): Command {
  const cmd = new Command('log')
    .description('Log a new trade')
    .argument('<symbol>', 'Stock/option symbol (e.g., TSLA, AAPL)')
    .option('-s, --side <side>', 'Trade side: long or short', 'long')
    .option('-e, --entry <price>', 'Entry price')
    .option('-x, --exit <price>', 'Exit price (creates closed trade)')
    .option('-q, --shares <quantity>', 'Number of shares/contracts', '1')
    .option('-d, --date <date>', 'Entry date (YYYY-MM-DD)', new Date().toISOString().split('T')[0])
    .option('--exit-date <date>', 'Exit date (YYYY-MM-DD)')
    .option('-t, --type <type>', 'Asset type: stock, option, futures, forex, crypto', 'stock')
    .option('--stop <price>', 'Stop loss price')
    .option('--target <price>', 'Take profit target price')
    .option('-c, --commission <amount>', 'Commission paid', '0')
    .option('-f, --fees <amount>', 'Other fees', '0')
    .option('-n, --notes <text>', 'Trade notes')
    .option('--strategy <name>', 'Strategy name')
    .option('--tags <tags>', 'Comma-separated tags')
    .action(async (symbol: string, options) => {
      await logTrade(symbol.toUpperCase(), options);
    });

  return cmd;
}

async function logTrade(
  symbol: string,
  options: {
    side: string;
    entry?: string;
    exit?: string;
    shares: string;
    date: string;
    exitDate?: string;
    type: string;
    stop?: string;
    target?: string;
    commission: string;
    fees: string;
    notes?: string;
    strategy?: string;
    tags?: string;
  }
): Promise<void> {
  // Validate side
  const side = options.side.toLowerCase();
  if (side !== 'long' && side !== 'short') {
    console.error(chalk.red('Error: Side must be "long" or "short"'));
    process.exit(1);
  }

  // Validate and parse entry price
  if (!options.entry) {
    console.error(chalk.red('Error: Entry price is required (--entry <price>)'));
    process.exit(1);
  }

  const entryPrice = parseFloat(options.entry);
  if (isNaN(entryPrice) || entryPrice <= 0) {
    console.error(chalk.red('Error: Invalid entry price'));
    process.exit(1);
  }

  // Parse quantity
  const quantity = parseFloat(options.shares);
  if (isNaN(quantity) || quantity <= 0) {
    console.error(chalk.red('Error: Invalid share quantity'));
    process.exit(1);
  }

  // Parse dates
  const entryDate = new Date(options.date);
  if (isNaN(entryDate.getTime())) {
    console.error(chalk.red('Error: Invalid entry date'));
    process.exit(1);
  }

  // Parse optional exit
  let exitPrice: number | null = null;
  let exitDate: Date | null = null;
  let status: 'open' | 'closed' = 'open';
  let pnl: number | null = null;
  let pnlPercent: number | null = null;

  if (options.exit) {
    exitPrice = parseFloat(options.exit);
    if (isNaN(exitPrice) || exitPrice <= 0) {
      console.error(chalk.red('Error: Invalid exit price'));
      process.exit(1);
    }
    status = 'closed';
    exitDate = options.exitDate ? new Date(options.exitDate) : new Date();
    
    // Calculate P&L
    const result = calculatePnL(
      side as 'long' | 'short',
      entryPrice,
      exitPrice,
      quantity,
      parseFloat(options.commission),
      parseFloat(options.fees)
    );
    pnl = result.pnl;
    pnlPercent = result.pnlPercent;
  }

  // Parse optional prices
  const stopLoss = options.stop ? parseFloat(options.stop) : null;
  const takeProfit = options.target ? parseFloat(options.target) : null;

  // Calculate risk/reward if we have stop and target
  let riskRewardRatio: number | null = null;
  if (stopLoss && takeProfit) {
    if (side === 'long') {
      const risk = entryPrice - stopLoss;
      const reward = takeProfit - entryPrice;
      riskRewardRatio = risk > 0 ? reward / risk : null;
    } else {
      const risk = stopLoss - entryPrice;
      const reward = entryPrice - takeProfit;
      riskRewardRatio = risk > 0 ? reward / risk : null;
    }
  }

  // Parse tags
  const tags = options.tags ? options.tags.split(',').map(t => t.trim()) : [];

  // Initialize database
  ensureDataDir();
  const db = getDatabase(getDatabasePath());

  // Create trade
  const trade = insertTrade(db, {
    symbol,
    side: side as 'long' | 'short',
    assetType: options.type as Trade['assetType'],
    status,
    entryPrice,
    entryDate,
    entryQuantity: quantity,
    exitPrice,
    exitDate,
    exitQuantity: exitPrice ? quantity : null,
    pnl,
    pnlPercent,
    stopLoss,
    takeProfit,
    riskRewardRatio,
    commission: parseFloat(options.commission),
    fees: parseFloat(options.fees),
    notes: options.notes ?? null,
    strategy: options.strategy ?? null,
    tags,
    importHash: null,
    importSource: 'manual',
  });

  // Display result
  console.log(chalk.bold.green('\n✓ Trade logged successfully!\n'));

  const sideColor = side === 'long' ? chalk.green : chalk.red;
  const pnlColor = pnl !== null && pnl >= 0 ? chalk.green : chalk.red;

  console.log(`  ${chalk.bold('ID:')}        ${trade.id}`);
  console.log(`  ${chalk.bold('Symbol:')}    ${chalk.cyan(symbol)}`);
  console.log(`  ${chalk.bold('Side:')}      ${sideColor(side.toUpperCase())}`);
  console.log(`  ${chalk.bold('Entry:')}     $${entryPrice.toFixed(2)} × ${quantity} shares`);
  console.log(`  ${chalk.bold('Date:')}      ${entryDate.toISOString().split('T')[0]}`);

  if (exitPrice !== null) {
    console.log(`  ${chalk.bold('Exit:')}      $${exitPrice.toFixed(2)}`);
    console.log(`  ${chalk.bold('P&L:')}       ${pnlColor(`$${pnl!.toFixed(2)} (${pnlPercent!.toFixed(2)}%)`)}`);
  }

  if (stopLoss) {
    console.log(`  ${chalk.bold('Stop:')}      $${stopLoss.toFixed(2)}`);
  }
  if (takeProfit) {
    console.log(`  ${chalk.bold('Target:')}    $${takeProfit.toFixed(2)}`);
  }
  if (riskRewardRatio) {
    console.log(`  ${chalk.bold('R:R:')}       1:${riskRewardRatio.toFixed(2)}`);
  }
  if (options.strategy) {
    console.log(`  ${chalk.bold('Strategy:')} ${options.strategy}`);
  }

  console.log();
}
