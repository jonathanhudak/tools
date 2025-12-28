// Local Finance Analyzer CLI
// A privacy-first personal finance tool with AI-powered categorization

import { Command } from 'commander';
import chalk from 'chalk';
import { createImportCommand } from './commands/import.js';
import { createListCommand } from './commands/list.js';
import { createCategorizeCommand } from './commands/categorize.js';
import { createRecurringCommand } from './commands/recurring.js';
import { createReportCommand } from './commands/report.js';
import { createConfigCommand } from './commands/config.js';
import { closeDatabase } from './core/database.js';

const program = new Command();

program
  .name('finance')
  .description('Local Finance Analyzer - Privacy-first personal finance tool')
  .version('1.0.0')
  .hook('postAction', () => {
    // Clean up database connection
    closeDatabase();
  });

// Add commands
program.addCommand(createImportCommand());
program.addCommand(createListCommand());
program.addCommand(createCategorizeCommand());
program.addCommand(createRecurringCommand());
program.addCommand(createReportCommand());
program.addCommand(createConfigCommand());

// Default action - show help
program.action(() => {
  console.log(chalk.bold.blue(`
  ╔═══════════════════════════════════════════════════════════╗
  ║             Local Finance Analyzer v1.0.0                 ║
  ║         Privacy-first personal finance tool               ║
  ╚═══════════════════════════════════════════════════════════╝
`));

  console.log(chalk.bold('Quick Start:'));
  console.log(`
  1. Import transactions:     ${chalk.cyan('finance import statement.csv')}
  2. Categorize transactions: ${chalk.cyan('finance categorize')}
  3. Detect subscriptions:    ${chalk.cyan('finance recurring detect --save')}
  4. Generate report:         ${chalk.cyan('finance report --year=2024 --open')}
`);

  console.log(chalk.bold('Commands:'));
  console.log(`
  ${chalk.cyan('import')} <file>     Import transactions from CSV
  ${chalk.cyan('list')}              View and search transactions
  ${chalk.cyan('categorize')}        Categorize transactions using rules & AI
  ${chalk.cyan('recurring')}         Manage recurring payments/subscriptions
  ${chalk.cyan('report')}            Generate HTML financial reports
  ${chalk.cyan('config')}            Manage configuration
`);

  console.log(chalk.dim('Run "finance <command> --help" for detailed usage.\n'));
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
