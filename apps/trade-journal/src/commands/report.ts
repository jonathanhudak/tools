// Report command - generate HTML reports

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';
import open from 'open';
import {
  startOfMonth,
  endOfMonth,
  format,
  parse,
} from 'date-fns';
import {
  getDatabase,
  calculateStats,
  getSymbolStats,
  getDailyStats,
  getTrades,
} from '../core/database.js';
import { getDatabasePath, ensureDataDir, getReportsDir } from '../core/config.js';

const MONTHS = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december'
];

export function createReportCommand(): Command {
  const cmd = new Command('report')
    .description('Generate an HTML report')
    .option('-m, --month <month>', 'Month name or number (e.g., january or 1)')
    .option('-y, --year <year>', 'Year (default: current year)')
    .option('--from <date>', 'Start date (YYYY-MM-DD)')
    .option('--to <date>', 'End date (YYYY-MM-DD)')
    .option('-o, --output <file>', 'Output file path')
    .option('--open', 'Open report in browser after generating')
    .action(async (options) => {
      await generateReport(options);
    });

  return cmd;
}

async function generateReport(options: {
  month?: string;
  year?: string;
  from?: string;
  to?: string;
  output?: string;
  open?: boolean;
}): Promise<void> {
  ensureDataDir();
  const db = getDatabase(getDatabasePath());

  // Determine date range
  let from: Date;
  let to: Date;
  let periodLabel: string;

  if (options.from && options.to) {
    from = new Date(options.from);
    to = new Date(options.to);
    periodLabel = `${format(from, 'MMM d, yyyy')} - ${format(to, 'MMM d, yyyy')}`;
  } else if (options.month) {
    const year = parseInt(options.year || new Date().getFullYear().toString());
    let monthNum: number;

    // Parse month
    const monthLower = options.month.toLowerCase();
    if (MONTHS.includes(monthLower)) {
      monthNum = MONTHS.indexOf(monthLower);
    } else {
      monthNum = parseInt(options.month) - 1;
    }

    if (isNaN(monthNum) || monthNum < 0 || monthNum > 11) {
      console.error(chalk.red('Error: Invalid month. Use name (january) or number (1-12)'));
      process.exit(1);
    }

    from = startOfMonth(new Date(year, monthNum));
    to = endOfMonth(new Date(year, monthNum));
    periodLabel = format(from, 'MMMM yyyy');
  } else {
    // Default to current month
    from = startOfMonth(new Date());
    to = endOfMonth(new Date());
    periodLabel = format(from, 'MMMM yyyy');
  }

  const spinner = ora('Generating report...').start();

  // Gather data
  const stats = calculateStats(db, from, to);
  const symbolStats = getSymbolStats(db, from, to);
  const dailyStats = getDailyStats(db, from, to);
  const trades = getTrades(db, { status: 'closed', from, to });

  if (stats.totalTrades === 0) {
    spinner.warn('No closed trades found for this period.');
    return;
  }

  // Generate report
  const html = generateHTML({
    periodLabel,
    from,
    to,
    stats,
    symbolStats,
    dailyStats,
    trades,
    generatedAt: new Date(),
  });

  // Write report
  const outputPath = options.output || path.join(
    getReportsDir(),
    `trade-report-${format(from, 'yyyy-MM')}.html`
  );

  fs.writeFileSync(outputPath, html);

  spinner.succeed(`Report generated: ${outputPath}`);

  if (options.open) {
    await open(outputPath);
  }

  console.log(chalk.green(`\n✓ Report saved to: ${outputPath}\n`));
}

function generateHTML(data: {
  periodLabel: string;
  from: Date;
  to: Date;
  stats: ReturnType<typeof calculateStats>;
  symbolStats: ReturnType<typeof getSymbolStats>;
  dailyStats: ReturnType<typeof getDailyStats>;
  trades: ReturnType<typeof getTrades>;
  generatedAt: Date;
}): string {
  const template = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Trade Report - {{periodLabel}}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0f172a;
      color: #e2e8f0;
      padding: 2rem;
      line-height: 1.5;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 {
      font-size: 2rem;
      margin-bottom: 0.5rem;
      color: #f8fafc;
    }
    h2 {
      font-size: 1.25rem;
      margin: 2rem 0 1rem;
      color: #94a3b8;
      border-bottom: 1px solid #334155;
      padding-bottom: 0.5rem;
    }
    .subtitle { color: #64748b; margin-bottom: 2rem; }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .card {
      background: #1e293b;
      border-radius: 8px;
      padding: 1.25rem;
      border: 1px solid #334155;
    }
    .card-label { color: #94a3b8; font-size: 0.875rem; }
    .card-value { font-size: 1.5rem; font-weight: 600; margin-top: 0.25rem; }
    .positive { color: #4ade80; }
    .negative { color: #f87171; }
    .neutral { color: #e2e8f0; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;
    }
    th, td {
      padding: 0.75rem;
      text-align: left;
      border-bottom: 1px solid #334155;
    }
    th { color: #94a3b8; font-weight: 500; background: #1e293b; }
    tr:hover { background: #1e293b; }
    .text-right { text-align: right; }
    .badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;
    }
    .badge-long { background: #166534; color: #4ade80; }
    .badge-short { background: #991b1b; color: #fca5a5; }
    .footer {
      margin-top: 3rem;
      padding-top: 1rem;
      border-top: 1px solid #334155;
      color: #64748b;
      font-size: 0.875rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>📊 Trade Report</h1>
    <p class="subtitle">{{periodLabel}}</p>

    <div class="grid">
      <div class="card">
        <div class="card-label">Total Trades</div>
        <div class="card-value neutral">{{stats.totalTrades}}</div>
      </div>
      <div class="card">
        <div class="card-label">Win Rate</div>
        <div class="card-value {{#if winRatePositive}}positive{{else}}negative{{/if}}">{{winRate}}%</div>
      </div>
      <div class="card">
        <div class="card-label">Total P&L</div>
        <div class="card-value {{#if pnlPositive}}positive{{else}}negative{{/if}}">{{totalPnl}}</div>
      </div>
      <div class="card">
        <div class="card-label">Profit Factor</div>
        <div class="card-value {{#if pfPositive}}positive{{else}}negative{{/if}}">{{profitFactor}}</div>
      </div>
    </div>

    <div class="grid">
      <div class="card">
        <div class="card-label">Winning Trades</div>
        <div class="card-value positive">{{stats.winningTrades}}</div>
      </div>
      <div class="card">
        <div class="card-label">Losing Trades</div>
        <div class="card-value negative">{{stats.losingTrades}}</div>
      </div>
      <div class="card">
        <div class="card-label">Average Win</div>
        <div class="card-value positive">{{avgWin}}</div>
      </div>
      <div class="card">
        <div class="card-label">Average Loss</div>
        <div class="card-value negative">{{avgLoss}}</div>
      </div>
    </div>

    <div class="grid">
      <div class="card">
        <div class="card-label">Largest Win</div>
        <div class="card-value positive">{{largestWin}}</div>
      </div>
      <div class="card">
        <div class="card-label">Largest Loss</div>
        <div class="card-value negative">{{largestLoss}}</div>
      </div>
      <div class="card">
        <div class="card-label">Expectancy</div>
        <div class="card-value {{#if pnlPositive}}positive{{else}}negative{{/if}}">{{expectancy}}</div>
      </div>
      <div class="card">
        <div class="card-label">Current Streak</div>
        <div class="card-value {{#if streakPositive}}positive{{else}}negative{{/if}}">{{currentStreak}}</div>
      </div>
    </div>

    <h2>Performance by Symbol</h2>
    <table>
      <thead>
        <tr>
          <th>Symbol</th>
          <th class="text-right">Trades</th>
          <th class="text-right">Win Rate</th>
          <th class="text-right">Total P&L</th>
          <th class="text-right">Avg P&L</th>
        </tr>
      </thead>
      <tbody>
        {{#each symbolStats}}
        <tr>
          <td><strong>{{symbol}}</strong></td>
          <td class="text-right">{{trades}}</td>
          <td class="text-right {{#if winRatePositive}}positive{{else}}negative{{/if}}">{{winRate}}%</td>
          <td class="text-right {{#if pnlPositive}}positive{{else}}negative{{/if}}">{{totalPnl}}</td>
          <td class="text-right {{#if pnlPositive}}positive{{else}}negative{{/if}}">{{avgPnl}}</td>
        </tr>
        {{/each}}
      </tbody>
    </table>

    <h2>All Trades</h2>
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Symbol</th>
          <th>Side</th>
          <th class="text-right">Entry</th>
          <th class="text-right">Exit</th>
          <th class="text-right">Qty</th>
          <th class="text-right">P&L</th>
        </tr>
      </thead>
      <tbody>
        {{#each trades}}
        <tr>
          <td>{{date}}</td>
          <td><strong>{{symbol}}</strong></td>
          <td><span class="badge {{#if isLong}}badge-long{{else}}badge-short{{/if}}">{{side}}</span></td>
          <td class="text-right">{{entryPrice}}</td>
          <td class="text-right">{{exitPrice}}</td>
          <td class="text-right">{{quantity}}</td>
          <td class="text-right {{#if pnlPositive}}positive{{else}}negative{{/if}}">{{pnl}}</td>
        </tr>
        {{/each}}
      </tbody>
    </table>

    <div class="footer">
      Generated on {{generatedAt}} by Trade Journal CLI
    </div>
  </div>
</body>
</html>
`;

  const compiled = Handlebars.compile(template);

  const formatCurrency = (val: number) => {
    const formatted = Math.abs(val).toFixed(2);
    return val >= 0 ? `$${formatted}` : `-$${formatted}`;
  };

  return compiled({
    periodLabel: data.periodLabel,
    stats: data.stats,
    winRate: data.stats.winRate.toFixed(1),
    winRatePositive: data.stats.winRate >= 50,
    totalPnl: formatCurrency(data.stats.totalPnl),
    pnlPositive: data.stats.totalPnl >= 0,
    profitFactor: data.stats.profitFactor === Infinity ? '∞' : data.stats.profitFactor.toFixed(2),
    pfPositive: data.stats.profitFactor >= 1,
    avgWin: formatCurrency(data.stats.averageWin),
    avgLoss: formatCurrency(data.stats.averageLoss),
    largestWin: formatCurrency(data.stats.largestWin),
    largestLoss: formatCurrency(data.stats.largestLoss),
    expectancy: formatCurrency(data.stats.expectancy),
    currentStreak: data.stats.currentStreak >= 0
      ? `${data.stats.currentStreak} wins`
      : `${Math.abs(data.stats.currentStreak)} losses`,
    streakPositive: data.stats.currentStreak >= 0,
    symbolStats: data.symbolStats.map(s => ({
      symbol: s.symbol,
      trades: s.trades,
      winRate: s.winRate.toFixed(1),
      winRatePositive: s.winRate >= 50,
      totalPnl: formatCurrency(s.totalPnl),
      avgPnl: formatCurrency(s.averagePnl),
      pnlPositive: s.totalPnl >= 0,
    })),
    trades: data.trades.map(t => ({
      date: format(t.entryDate, 'yyyy-MM-dd'),
      symbol: t.symbol,
      side: t.side.toUpperCase(),
      isLong: t.side === 'long',
      entryPrice: `$${t.entryPrice.toFixed(2)}`,
      exitPrice: t.exitPrice ? `$${t.exitPrice.toFixed(2)}` : '-',
      quantity: t.entryQuantity,
      pnl: formatCurrency(t.pnl ?? 0),
      pnlPositive: (t.pnl ?? 0) >= 0,
    })),
    generatedAt: format(data.generatedAt, 'MMMM d, yyyy h:mm a'),
  });
}
