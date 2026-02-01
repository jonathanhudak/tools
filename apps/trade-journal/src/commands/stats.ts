// Stats command - display trading statistics

import { Command } from 'commander';
import chalk from 'chalk';
import Table from 'cli-table3';
import {
  startOfWeek,
  startOfMonth,
  startOfYear,
  subDays,
  subWeeks,
  subMonths,
  format,
} from 'date-fns';
import {
  getDatabase,
  calculateStats,
  getSymbolStats,
  getDailyStats,
  getTrades,
} from '../core/database.js';
import { getDatabasePath, ensureDataDir } from '../core/config.js';

type Period = 'day' | 'week' | 'month' | 'year' | 'all';

export function createStatsCommand(): Command {
  const cmd = new Command('stats')
    .description('Display trading statistics')
    .option('-p, --period <period>', 'Time period: day, week, month, year, all', 'all')
    .option('-s, --symbol <symbol>', 'Filter by symbol')
    .option('--from <date>', 'Start date (YYYY-MM-DD)')
    .option('--to <date>', 'End date (YYYY-MM-DD)')
    .option('--by-symbol', 'Show stats grouped by symbol')
    .option('--daily', 'Show daily breakdown')
    .action(async (options) => {
      await showStats(options);
    });

  return cmd;
}

async function showStats(options: {
  period: Period;
  symbol?: string;
  from?: string;
  to?: string;
  bySymbol?: boolean;
  daily?: boolean;
}): Promise<void> {
  ensureDataDir();
  const db = getDatabase(getDatabasePath());

  // Determine date range
  let from: Date | undefined;
  let to: Date | undefined = new Date();

  if (options.from) {
    from = new Date(options.from);
  } else {
    switch (options.period) {
      case 'day':
        from = new Date();
        from.setHours(0, 0, 0, 0);
        break;
      case 'week':
        from = startOfWeek(new Date(), { weekStartsOn: 1 });
        break;
      case 'month':
        from = startOfMonth(new Date());
        break;
      case 'year':
        from = startOfYear(new Date());
        break;
      case 'all':
        from = undefined;
        break;
    }
  }

  if (options.to) {
    to = new Date(options.to);
  }

  // Show header
  const periodLabel = options.from
    ? `${options.from} to ${options.to || 'now'}`
    : options.period.toUpperCase();

  console.log(chalk.bold.blue(`
╔═══════════════════════════════════════════════════════════════╗
║                    Trade Journal Statistics                    ║
║                        ${periodLabel.padStart(15).padEnd(20)}                       ║
╚═══════════════════════════════════════════════════════════════╝
`));

  // Get overall stats
  const stats = calculateStats(db, from, to);

  if (stats.totalTrades === 0) {
    console.log(chalk.yellow('No closed trades found for this period.'));
    console.log(chalk.dim('\nLog trades with: trade log TSLA --side long --entry 280 --exit 285 --shares 100\n'));
    return;
  }

  // Main stats table
  const mainTable = new Table({
    chars: { 'mid': '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
  });

  const pnlColor = stats.totalPnl >= 0 ? chalk.green : chalk.red;
  const winRateColor = stats.winRate >= 50 ? chalk.green : stats.winRate >= 40 ? chalk.yellow : chalk.red;

  mainTable.push(
    [chalk.bold('Total Trades'), stats.totalTrades.toString()],
    [chalk.bold('Win Rate'), winRateColor(`${stats.winRate.toFixed(1)}%`)],
    ['', ''],
    [chalk.green('Winning Trades'), stats.winningTrades.toString()],
    [chalk.red('Losing Trades'), stats.losingTrades.toString()],
    [chalk.dim('Break Even'), stats.breakEvenTrades.toString()],
    ['', ''],
    [chalk.bold('Total P&L'), pnlColor(`$${stats.totalPnl.toFixed(2)}`)],
    [chalk.green('Gross Profit'), chalk.green(`$${stats.grossProfit.toFixed(2)}`)],
    [chalk.red('Gross Loss'), chalk.red(`$${stats.grossLoss.toFixed(2)}`)],
    ['', ''],
    [chalk.bold('Average Win'), chalk.green(`$${stats.averageWin.toFixed(2)}`)],
    [chalk.bold('Average Loss'), chalk.red(`$${stats.averageLoss.toFixed(2)}`)],
    [chalk.bold('Average Trade'), pnlColor(`$${stats.averagePnl.toFixed(2)}`)],
    ['', ''],
    [chalk.bold('Largest Win'), chalk.green(`$${stats.largestWin.toFixed(2)}`)],
    [chalk.bold('Largest Loss'), chalk.red(`$${stats.largestLoss.toFixed(2)}`)],
    ['', ''],
    [chalk.bold('Profit Factor'), stats.profitFactor === Infinity ? '∞' : stats.profitFactor.toFixed(2)],
    [chalk.bold('Expectancy'), pnlColor(`$${stats.expectancy.toFixed(2)}`)],
  );

  if (stats.averageRiskReward !== null) {
    mainTable.push([chalk.bold('Avg R:R'), `1:${stats.averageRiskReward.toFixed(2)}`]);
  }

  mainTable.push(
    ['', ''],
    [chalk.bold('Current Streak'), stats.currentStreak >= 0 
      ? chalk.green(`${stats.currentStreak} wins`)
      : chalk.red(`${Math.abs(stats.currentStreak)} losses`)],
    [chalk.bold('Longest Win Streak'), chalk.green(stats.longestWinStreak.toString())],
    [chalk.bold('Longest Lose Streak'), chalk.red(stats.longestLoseStreak.toString())],
  );

  console.log(mainTable.toString());

  // By symbol breakdown
  if (options.bySymbol) {
    console.log(chalk.bold('\n📊 Performance by Symbol:\n'));
    
    const symbolStats = getSymbolStats(db, from, to);
    
    const symbolTable = new Table({
      head: [
        chalk.bold('Symbol'),
        chalk.bold('Trades'),
        chalk.bold('Win Rate'),
        chalk.bold('Total P&L'),
        chalk.bold('Avg P&L'),
      ],
      colAligns: ['left', 'right', 'right', 'right', 'right'],
    });

    for (const s of symbolStats.slice(0, 20)) {
      const pnlClr = s.totalPnl >= 0 ? chalk.green : chalk.red;
      const wrClr = s.winRate >= 50 ? chalk.green : chalk.red;
      
      symbolTable.push([
        chalk.cyan(s.symbol),
        s.trades.toString(),
        wrClr(`${s.winRate.toFixed(1)}%`),
        pnlClr(`$${s.totalPnl.toFixed(2)}`),
        pnlClr(`$${s.averagePnl.toFixed(2)}`),
      ]);
    }

    console.log(symbolTable.toString());
  }

  // Daily breakdown
  if (options.daily) {
    console.log(chalk.bold('\n📅 Daily Performance:\n'));
    
    const dailyStats = getDailyStats(db, from, to);
    
    const dailyTable = new Table({
      head: [
        chalk.bold('Date'),
        chalk.bold('Trades'),
        chalk.bold('Wins'),
        chalk.bold('Losses'),
        chalk.bold('P&L'),
      ],
      colAligns: ['left', 'right', 'right', 'right', 'right'],
    });

    for (const day of dailyStats.slice(-30)) {
      const pnlClr = day.pnl >= 0 ? chalk.green : chalk.red;
      
      dailyTable.push([
        format(day.date, 'yyyy-MM-dd (EEE)'),
        day.trades.toString(),
        chalk.green(day.wins.toString()),
        chalk.red(day.losses.toString()),
        pnlClr(`$${day.pnl.toFixed(2)}`),
      ]);
    }

    console.log(dailyTable.toString());
  }

  // Recent trades preview
  console.log(chalk.bold('\n📝 Recent Closed Trades:\n'));
  
  const recentTrades = getTrades(db, { status: 'closed', from, to, limit: 5 });
  
  const recentTable = new Table({
    head: [
      chalk.bold('Date'),
      chalk.bold('Symbol'),
      chalk.bold('Side'),
      chalk.bold('Entry'),
      chalk.bold('Exit'),
      chalk.bold('P&L'),
    ],
    colAligns: ['left', 'left', 'left', 'right', 'right', 'right'],
  });

  for (const trade of recentTrades) {
    const pnlClr = (trade.pnl ?? 0) >= 0 ? chalk.green : chalk.red;
    const sideClr = trade.side === 'long' ? chalk.green : chalk.red;
    
    recentTable.push([
      format(trade.entryDate, 'yyyy-MM-dd'),
      chalk.cyan(trade.symbol),
      sideClr(trade.side.toUpperCase()),
      `$${trade.entryPrice.toFixed(2)}`,
      trade.exitPrice ? `$${trade.exitPrice.toFixed(2)}` : '-',
      pnlClr(`$${(trade.pnl ?? 0).toFixed(2)}`),
    ]);
  }

  console.log(recentTable.toString());
  console.log();
}
