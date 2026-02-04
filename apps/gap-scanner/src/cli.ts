#!/usr/bin/env node

/**
 * Gap Scanner CLI - Pre-market gap scanner for Gap & Go trading strategy
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { createFinnhubClient } from './api/finnhub.js';
import { createGapScanner } from './scanners/gap-scanner.js';
import { formatTable, formatFilters } from './formatters/table.js';
import { saveJSON } from './formatters/json.js';
import type { ScanOptions } from './types/index.js';

const program = new Command();

program
  .name('gap')
  .description('Pre-market gap scanner CLI using Finnhub API')
  .version('0.0.1');

/**
 * Scan command - main functionality
 */
program
  .command('scan')
  .description('Scan for pre-market gaps')
  .option('--min-gap <percent>', 'Minimum gap percentage', '4')
  .option('--min-volume <number>', 'Minimum pre-market volume', '100000')
  .option('--max-float <number>', 'Maximum float (shares outstanding)', '50000000')
  .option('--price-min <dollars>', 'Minimum price', '2')
  .option('--price-max <dollars>', 'Maximum price', '20')
  .option('-w, --watch', 'Continuous scanning mode')
  .option('-i, --interval <seconds>', 'Scan interval in seconds (watch mode)', '60')
  .option('-o, --output <filepath>', 'Save results to JSON file')
  .option('--api-key <key>', 'Finnhub API key (or set FINNHUB_API_KEY env var)')
  .action(async (options: ScanOptions) => {
    try {
      // Create Finnhub client
      const client = createFinnhubClient(options.apiKey);

      // Validate API key
      const spinner = ora('Validating API key...').start();
      const isValid = await client.validateApiKey();

      if (!isValid) {
        spinner.fail('Invalid API key');
        console.log(chalk.yellow('\nPlease check your Finnhub API key.'));
        console.log(chalk.gray('Get a free key at: https://finnhub.io/register\n'));
        process.exit(1);
      }

      spinner.succeed('API key validated');

      // Create scanner with filters
      const scanner = createGapScanner(client, {
        minGap: parseFloat(options.minGap || '4'),
        minVolume: parseInt(options.minVolume || '100000', 10),
        maxFloat: parseInt(options.maxFloat || '50000000', 10),
        priceMin: parseFloat(options.priceMin || '2'),
        priceMax: parseFloat(options.priceMax || '20'),
      });

      // Run scan
      const runScan = async (): Promise<void> => {
        const scanSpinner = ora('Scanning for gaps...').start();

        try {
          const result = await scanner.scanDefault();
          scanSpinner.succeed(`Scan complete - found ${result.totalPassed} candidates`);

          // Display results
          console.log(formatFilters(result));
          console.log(formatTable(result));

          // Save to JSON if requested
          if (options.output) {
            const filepath = await saveJSON(result, options.output);
            console.log(chalk.green(`✓ Results saved to ${filepath}\n`));
          }
        } catch (error) {
          scanSpinner.fail('Scan failed');
          console.error(chalk.red('Error:'), error);
        }
      };

      // Watch mode or single scan
      if (options.watch) {
        const interval = parseInt(options.interval || '60', 10) * 1000;
        console.log(chalk.blue(`\n🔄 Watch mode enabled - scanning every ${interval / 1000} seconds`));
        console.log(chalk.gray('Press Ctrl+C to stop\n'));

        // Initial scan
        await runScan();

        // Repeat scan at interval
        setInterval(runScan, interval);
      } else {
        await runScan();
      }
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

/**
 * Watchlist command - manage custom watchlist (placeholder for Phase 2)
 */
program
  .command('watchlist')
  .description('Manage custom watchlist (coming in Phase 2)')
  .option('--add <tickers...>', 'Add tickers to watchlist')
  .option('--remove <tickers...>', 'Remove tickers from watchlist')
  .option('--list', 'List all tickers in watchlist')
  .option('--clear', 'Clear watchlist')
  .action(() => {
    console.log(chalk.yellow('\n⚠️  Watchlist management coming in Phase 2\n'));
    console.log(chalk.gray('For now, the scanner uses a built-in list of popular tickers.\n'));
  });

/**
 * Alert command - set up alerts (placeholder for Phase 2)
 */
program
  .command('alert')
  .description('Set up gap alerts (coming in Phase 2)')
  .option('--start <time>', 'Alert start time (e.g., 6:00)')
  .option('--end <time>', 'Alert end time (e.g., 9:30)')
  .option('--enabled', 'Enable alerts')
  .action(() => {
    console.log(chalk.yellow('\n⚠️  Alert functionality coming in Phase 2\n'));
    console.log(chalk.gray('Use --watch mode for continuous monitoring.\n'));
  });

/**
 * Config command - manage API key and settings
 */
program
  .command('config')
  .description('Show configuration information')
  .action(() => {
    console.log(chalk.bold('\n📋 Gap Scanner Configuration\n'));

    const apiKey = process.env.FINNHUB_API_KEY;
    if (apiKey) {
      const masked = apiKey.substring(0, 4) + '*'.repeat(apiKey.length - 4);
      console.log(chalk.green('✓') + ' API Key: ' + chalk.gray(masked));
    } else {
      console.log(chalk.yellow('⚠') + ' API Key: ' + chalk.red('Not set'));
      console.log(chalk.gray('\n  Set your API key:'));
      console.log(chalk.gray('    export FINNHUB_API_KEY=your_key_here'));
      console.log(chalk.gray('  Or use --api-key flag with scan command\n'));
    }

    console.log(chalk.gray('\nGet a free API key at: https://finnhub.io/register\n'));
  });

// Parse command line arguments
program.parse();
