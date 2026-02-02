// Import command - import trades from CSV files

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import path from 'path';
import fs from 'fs';
import {
  getDatabase,
  insertTrade,
  tradeExists,
  createImport,
  calculatePnL,
} from '../core/database.js';
import { getDatabasePath, ensureDataDir } from '../core/config.js';
import {
  parseToSCSV,
  generateImportHash,
  groupTradesBySymbol,
  type ParsedToSTrade,
} from '../import/tos-parser.js';

export function createImportCommand(): Command {
  const cmd = new Command('import')
    .description('Import trades from a CSV file')
    .argument('<file>', 'Path to the CSV file')
    .option('-f, --format <format>', 'CSV format: tos (ThinkorSwim)', 'tos')
    .option('--dry-run', 'Preview import without saving')
    .option('--match-trades', 'Attempt to match entries with exits', true)
    .action(async (file: string, options) => {
      await runImport(file, options);
    });

  return cmd;
}

async function runImport(
  file: string,
  options: {
    format: string;
    dryRun?: boolean;
    matchTrades?: boolean;
  }
): Promise<void> {
  // Check file exists
  const filePath = path.resolve(file);
  if (!fs.existsSync(filePath)) {
    console.error(chalk.red(`Error: File not found: ${filePath}`));
    process.exit(1);
  }

  const spinner = ora('Parsing CSV file...').start();

  // Parse based on format
  let parseResult;
  if (options.format.toLowerCase() === 'tos') {
    parseResult = parseToSCSV(filePath);
  } else {
    spinner.fail('Unknown format');
    console.error(chalk.red(`Error: Unknown format "${options.format}". Supported: tos`));
    process.exit(1);
  }

  if (parseResult.errors.length > 0 && parseResult.trades.length === 0) {
    spinner.fail('Failed to parse CSV');
    for (const error of parseResult.errors) {
      console.error(chalk.red(`  ${error}`));
    }
    process.exit(1);
  }

  spinner.succeed(
    `Parsed ${parseResult.trades.length} trade records from ${parseResult.totalRows} rows`
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

  if (parseResult.trades.length === 0) {
    console.log(chalk.yellow('\nNo trades to import.'));
    return;
  }

  // Group by symbol to match entries with exits
  const grouped = groupTradesBySymbol(parseResult.trades);
  
  console.log(chalk.bold('\nTrade Summary by Symbol:'));
  console.log('─'.repeat(60));
  
  for (const group of grouped.slice(0, 10)) {
    const entries = group.entries.length;
    const exits = group.exits.length;
    console.log(
      `  ${chalk.cyan(group.symbol.padEnd(10))} ` +
      `${chalk.green(`${entries} entries`)} / ${chalk.red(`${exits} exits`)}`
    );
  }
  
  if (grouped.length > 10) {
    console.log(chalk.dim(`  ... and ${grouped.length - 10} more symbols`));
  }
  console.log('─'.repeat(60));

  // Dry run stops here
  if (options.dryRun) {
    console.log(chalk.cyan('\nDry run complete. No changes made.'));
    return;
  }

  // Initialize database
  ensureDataDir();
  const db = getDatabase(getDatabasePath());

  const importSpinner = ora('Importing trades...').start();

  let imported = 0;
  let skipped = 0;
  let matched = 0;

  // Process each group - try to match entries with exits
  for (const group of grouped) {
    const { entries, exits } = group;
    
    // Sort by time
    entries.sort((a, b) => a.execTime.getTime() - b.execTime.getTime());
    exits.sort((a, b) => a.execTime.getTime() - b.execTime.getTime());

    // FIFO matching: match oldest entry with oldest exit
    const usedExits = new Set<number>();

    for (const entry of entries) {
      const importHash = generateImportHash(
        entry.execTime,
        entry.symbol,
        entry.side,
        entry.price,
        entry.quantity
      );

      if (tradeExists(db, importHash)) {
        skipped++;
        continue;
      }

      // Try to find matching exit
      let matchedExit: ParsedToSTrade | null = null;
      let matchedExitIdx = -1;

      if (options.matchTrades) {
        for (let i = 0; i < exits.length; i++) {
          if (usedExits.has(i)) continue;
          
          const exit = exits[i];
          // Exit must be after entry and same quantity
          if (
            exit.execTime > entry.execTime &&
            exit.quantity === entry.quantity
          ) {
            matchedExit = exit;
            matchedExitIdx = i;
            break;
          }
        }
      }

      // Calculate P&L if we have an exit
      let pnl: number | null = null;
      let pnlPercent: number | null = null;
      
      if (matchedExit) {
        usedExits.add(matchedExitIdx);
        const result = calculatePnL(
          entry.side,
          entry.price,
          matchedExit.price,
          entry.quantity
        );
        pnl = result.pnl;
        pnlPercent = result.pnlPercent;
        matched++;
      }

      // Insert trade
      insertTrade(db, {
        symbol: entry.symbol,
        side: entry.side,
        assetType: entry.assetType,
        status: matchedExit ? 'closed' : 'open',
        entryPrice: entry.price,
        entryDate: entry.execTime,
        entryQuantity: entry.quantity,
        exitPrice: matchedExit?.price ?? null,
        exitDate: matchedExit?.execTime ?? null,
        exitQuantity: matchedExit?.quantity ?? null,
        pnl,
        pnlPercent,
        stopLoss: null,
        takeProfit: null,
        riskRewardRatio: null,
        commission: 0,
        fees: 0,
        notes: null,
        strategy: null,
        tags: [],
        importHash,
        importSource: 'tos',
      });

      imported++;
    }

    // Also import unmatched exits as standalone (closing) trades
    for (let i = 0; i < exits.length; i++) {
      if (usedExits.has(i)) continue;
      
      const exit = exits[i];
      const importHash = generateImportHash(
        exit.execTime,
        exit.symbol,
        'close-' + exit.side,
        exit.price,
        exit.quantity
      );

      if (tradeExists(db, importHash)) {
        skipped++;
        continue;
      }

      // Create as a closed trade (we don't know the entry)
      insertTrade(db, {
        symbol: exit.symbol,
        side: exit.side,
        assetType: exit.assetType,
        status: 'closed',
        entryPrice: exit.price, // Use exit price as entry (unknown entry)
        entryDate: exit.execTime,
        entryQuantity: exit.quantity,
        exitPrice: exit.price,
        exitDate: exit.execTime,
        exitQuantity: exit.quantity,
        pnl: 0, // Unknown P&L
        pnlPercent: 0,
        stopLoss: null,
        takeProfit: null,
        riskRewardRatio: null,
        commission: 0,
        fees: 0,
        notes: 'Exit only - entry not found',
        strategy: null,
        tags: ['unmatched-exit'],
        importHash,
        importSource: 'tos',
      });

      imported++;
    }
  }

  // Record import
  createImport(db, {
    filename: path.basename(filePath),
    source: options.format,
    rowCount: parseResult.totalRows,
    importedCount: imported,
    skippedCount: skipped,
  });

  importSpinner.succeed(
    `Imported ${imported} trades (${matched} matched, ${skipped} duplicates skipped)`
  );

  console.log(chalk.green(`\n✓ Import complete!`));
  console.log(chalk.dim(`Run 'trade stats' to see your trading statistics.\n`));
}
