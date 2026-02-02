// Trade Journal CLI
// A local-first trading journal with statistics and reporting

import { Command } from 'commander';
import chalk from 'chalk';
import { createLogCommand } from './commands/log.js';
import { createImportCommand } from './commands/import.js';
import { createStatsCommand } from './commands/stats.js';
import { createReportCommand } from './commands/report.js';
import { createListCommand } from './commands/list.js';
import { closeDatabase } from './core/database.js';

const program = new Command();

program
  .name('trade')
  .description('Trade Journal - Log trades, track statistics, generate reports')
  .version('1.0.0')
  .hook('postAction', () => {
    closeDatabase();
  });

// Add commands
program.addCommand(createLogCommand());
program.addCommand(createImportCommand());
program.addCommand(createStatsCommand());
program.addCommand(createReportCommand());
program.addCommand(createListCommand());

// Default action - show help
program.action(() => {
  console.log(chalk.bold.cyan(`
  ╔═══════════════════════════════════════════════════════════╗
  ║               Trade Journal CLI v1.0.0                    ║
  ║       Log trades • Track stats • Generate reports         ║
  ╚═══════════════════════════════════════════════════════════╝
`));

  console.log(chalk.bold('Quick Start:'));
  console.log(`
  1. Log a trade:    ${chalk.cyan('trade log TSLA --side long --entry 280.50 --exit 285.00 --shares 100')}
  2. Import trades:  ${chalk.cyan('trade import ~/Downloads/tos-trades.csv')}
  3. View stats:     ${chalk.cyan('trade stats --period week')}
  4. Generate report: ${chalk.cyan('trade report --month january --open')}
`);

  console.log(chalk.bold('Commands:'));
  console.log(`
  ${chalk.cyan('log')} <symbol>      Log a new trade manually
  ${chalk.cyan('import')} <file>     Import trades from CSV (ThinkorSwim)
  ${chalk.cyan('list')}              View logged trades
  ${chalk.cyan('stats')}             Display trading statistics
  ${chalk.cyan('report')}            Generate HTML report
`);

  console.log(chalk.bold('Examples:'));
  console.log(`
  ${chalk.dim('# Log a closed long trade with profit')}
  ${chalk.cyan('trade log AAPL --side long --entry 175.50 --exit 182.00 --shares 50')}

  ${chalk.dim('# Log an open short position')}
  ${chalk.cyan('trade log SPY --side short --entry 450.00 --shares 100 --stop 455 --target 440')}

  ${chalk.dim('# Import ThinkorSwim trades')}
  ${chalk.cyan('trade import ./trades.csv --format tos')}

  ${chalk.dim('# View weekly stats with symbol breakdown')}
  ${chalk.cyan('trade stats --period week --by-symbol')}

  ${chalk.dim('# Generate January report and open in browser')}
  ${chalk.cyan('trade report --month january --open')}
`);

  console.log(chalk.dim('Run "trade <command> --help" for detailed usage.\n'));
});

// Error handling
program.exitOverride((err) => {
  if (err.code === 'commander.helpDisplayed') {
    process.exit(0);
  }
  if (err.code === 'commander.version') {
    process.exit(0);
  }
  console.error(chalk.red(err.message));
  process.exit(1);
});

// Parse arguments
program.parse();
