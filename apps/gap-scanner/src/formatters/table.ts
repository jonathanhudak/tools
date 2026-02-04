/**
 * Table formatter for displaying scan results
 */

import chalk from 'chalk';
import type { ScanResult, StockGap } from '../types/index.js';

/**
 * Format a number as currency
 */
function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`;
}

/**
 * Format a number with M/K suffix
 */
function formatNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K`;
  }
  return value.toString();
}

/**
 * Format gap percentage with color
 */
function formatGapPercent(percent: number): string {
  const formatted = `${percent > 0 ? '+' : ''}${percent.toFixed(1)}%`;
  return percent > 0 ? chalk.green(formatted) : chalk.red(formatted);
}

/**
 * Format relative volume with color
 */
function formatRelativeVolume(rvol: number): string {
  const formatted = `${rvol.toFixed(1)}x`;
  if (rvol >= 3.0) return chalk.green(formatted);
  if (rvol >= 2.0) return chalk.yellow(formatted);
  return formatted;
}

/**
 * Pad string to width
 */
function pad(str: string, width: number, align: 'left' | 'right' = 'left'): string {
  // Remove ANSI color codes for length calculation
  const cleanStr = str.replace(/\x1b\[[0-9;]*m/g, '');
  const padding = Math.max(0, width - cleanStr.length);

  if (align === 'right') {
    return ' '.repeat(padding) + str;
  }
  return str + ' '.repeat(padding);
}

/**
 * Format scan results as a table
 */
export function formatTable(result: ScanResult): string {
  if (result.candidates.length === 0) {
    return chalk.yellow('\nNo gaps found matching the criteria.\n');
  }

  const lines: string[] = [];

  // Header
  lines.push(chalk.bold('\nGap Scanner Results'));
  lines.push(chalk.gray(`Scanned: ${result.totalScanned} | Found: ${result.totalPassed} | Time: ${result.timestamp.toLocaleTimeString()}`));
  lines.push('');

  // Column headers
  const headers = [
    pad('TICKER', 8),
    pad('GAP%', 8, 'right'),
    pad('PRICE', 10, 'right'),
    pad('VOL', 8, 'right'),
    pad('FLOAT', 8, 'right'),
    pad('RVOL', 8, 'right'),
  ];
  lines.push(chalk.bold(headers.join('  ')));
  lines.push(chalk.gray('─'.repeat(60)));

  // Data rows
  for (const stock of result.candidates) {
    const row = [
      pad(chalk.cyan(stock.ticker), 8),
      pad(formatGapPercent(stock.gapPercent), 8, 'right'),
      pad(formatCurrency(stock.currentPrice), 10, 'right'),
      pad(formatNumber(stock.volume), 8, 'right'),
      pad(formatNumber(stock.float), 8, 'right'),
      pad(formatRelativeVolume(stock.relativeVolume), 8, 'right'),
    ];
    lines.push(row.join('  '));
  }

  lines.push('');

  return lines.join('\n');
}

/**
 * Format a single stock for display
 */
export function formatStock(stock: StockGap): string {
  const lines: string[] = [];

  lines.push(chalk.bold.cyan(stock.ticker) + chalk.gray(` - ${stock.name}`));
  lines.push(`  Gap: ${formatGapPercent(stock.gapPercent)}`);
  lines.push(`  Price: ${formatCurrency(stock.currentPrice)} (prev: ${formatCurrency(stock.previousClose)})`);
  lines.push(`  Float: ${formatNumber(stock.float)}`);
  lines.push(`  Volume: ${formatNumber(stock.volume)} (${formatRelativeVolume(stock.relativeVolume)} relative)`);

  return lines.join('\n');
}

/**
 * Format scan filters
 */
export function formatFilters(result: ScanResult): string {
  const f = result.filters;
  return chalk.gray(
    `Filters: Gap ≥${f.minGap}% | Vol ≥${formatNumber(f.minVolume)} | Float ≤${formatNumber(f.maxFloat)} | Price $${f.priceMin}-$${f.priceMax}`
  );
}
