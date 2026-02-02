// ThinkorSwim (ToS) CSV Parser
// Parses trade exports from TD Ameritrade/Schwab ThinkorSwim platform

import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { createHash } from 'crypto';
import type { ToSTradeRow } from '../core/types.js';

export interface ParsedToSTrade {
  execTime: Date;
  symbol: string;
  side: 'long' | 'short';
  assetType: 'stock' | 'option';
  quantity: number;
  price: number;
  netPrice: number;
  isOpening: boolean;
  optionDetails?: {
    expDate: string;
    strike: string;
    type: 'CALL' | 'PUT';
  };
  rawRow: Record<string, unknown>;
}

export interface ToSParseResult {
  trades: ParsedToSTrade[];
  errors: string[];
  totalRows: number;
}

// ThinkorSwim CSV columns (Account Statement > Transactions)
const TOS_COLUMNS = [
  'Exec Time',
  'Spread',
  'Side',
  'Qty',
  'Pos Effect',
  'Symbol',
  'Exp',
  'Strike',
  'Type',
  'Price',
  'Net Price',
  'Order Type',
];

export function parseToSCSV(filePath: string): ToSParseResult {
  const result: ToSParseResult = {
    trades: [],
    errors: [],
    totalRows: 0,
  };

  const content = fs.readFileSync(filePath, 'utf-8');
  
  // ToS exports can have multiple sections. Find the trades section
  const lines = content.split('\n');
  let startIdx = -1;
  let endIdx = lines.length;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    // Look for header row containing trade columns
    if (line.includes('exec time') && line.includes('symbol') && line.includes('qty')) {
      startIdx = i;
    }
    // Stop at next section header or empty lines after data
    if (startIdx > -1 && i > startIdx + 1 && line.trim() === '') {
      endIdx = i;
      break;
    }
  }

  if (startIdx === -1) {
    result.errors.push('Could not find trade data in CSV. Expected ThinkorSwim export format.');
    return result;
  }

  const tradeSection = lines.slice(startIdx, endIdx).join('\n');

  let records: Record<string, string>[];
  try {
    records = parse(tradeSection, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
    });
  } catch (e) {
    result.errors.push(`CSV parse error: ${(e as Error).message}`);
    return result;
  }

  result.totalRows = records.length;

  for (let i = 0; i < records.length; i++) {
    const row = records[i];
    
    try {
      const trade = parseToSRow(row);
      if (trade) {
        result.trades.push(trade);
      }
    } catch (e) {
      result.errors.push(`Row ${i + 2}: ${(e as Error).message}`);
    }
  }

  return result;
}

function parseToSRow(row: Record<string, string>): ParsedToSTrade | null {
  // Get values with flexible column name matching
  const execTime = row['Exec Time'] || row['exec time'] || row['EXEC TIME'];
  const spread = row['Spread'] || row['spread'] || row['SPREAD'] || '';
  const side = row['Side'] || row['side'] || row['SIDE'];
  const qty = row['Qty'] || row['qty'] || row['QTY'];
  const posEffect = row['Pos Effect'] || row['pos effect'] || row['POS EFFECT'];
  const symbol = row['Symbol'] || row['symbol'] || row['SYMBOL'];
  const exp = row['Exp'] || row['exp'] || row['EXP'] || '';
  const strike = row['Strike'] || row['strike'] || row['STRIKE'] || '';
  const type = row['Type'] || row['type'] || row['TYPE'] || '';
  const price = row['Price'] || row['price'] || row['PRICE'];
  const netPrice = row['Net Price'] || row['net price'] || row['NET PRICE'];

  // Skip rows without required data
  if (!execTime || !symbol || !qty || !price) {
    return null;
  }

  // Parse execution time - ToS format: "MM/DD/YY HH:MM:SS" or similar
  const date = parseToSDate(execTime);
  if (!date) {
    throw new Error(`Invalid date format: ${execTime}`);
  }

  // Parse quantity (can have +/- prefix)
  const quantity = Math.abs(parseFloat(qty.replace(/[+,]/g, '')));
  if (isNaN(quantity) || quantity === 0) {
    return null;
  }

  // Parse prices
  const priceVal = parseFloat(price.replace(/[$,]/g, ''));
  const netPriceVal = parseFloat((netPrice || price).replace(/[$,]/g, ''));

  // Determine if it's an option
  const isOption = !!(exp && strike && type);
  
  // Determine side: BUY_TO_OPEN/BUY = long entry, SELL_TO_OPEN = short entry
  // BUY_TO_CLOSE = closing short, SELL_TO_CLOSE = closing long
  const sideUpper = (side || '').toUpperCase();
  const posEffectUpper = (posEffect || '').toUpperCase();
  
  let tradeSide: 'long' | 'short';
  let isOpening: boolean;

  if (posEffectUpper.includes('OPEN') || posEffectUpper === 'TO OPEN') {
    isOpening = true;
    tradeSide = sideUpper.includes('BUY') ? 'long' : 'short';
  } else if (posEffectUpper.includes('CLOSE') || posEffectUpper === 'TO CLOSE') {
    isOpening = false;
    // Closing trade - side is opposite of what we're closing
    tradeSide = sideUpper.includes('BUY') ? 'short' : 'long';
  } else {
    // Default based on side
    isOpening = sideUpper.includes('BUY');
    tradeSide = sideUpper.includes('BUY') ? 'long' : 'short';
  }

  const trade: ParsedToSTrade = {
    execTime: date,
    symbol: symbol.toUpperCase(),
    side: tradeSide,
    assetType: isOption ? 'option' : 'stock',
    quantity,
    price: priceVal,
    netPrice: netPriceVal,
    isOpening,
    rawRow: row,
  };

  if (isOption) {
    trade.optionDetails = {
      expDate: exp,
      strike: strike,
      type: type.toUpperCase().includes('CALL') ? 'CALL' : 'PUT',
    };
  }

  return trade;
}

function parseToSDate(dateStr: string): Date | null {
  // Try various ToS date formats
  const formats = [
    // MM/DD/YY HH:MM:SS
    /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})\s+(\d{1,2}):(\d{2}):(\d{2})$/,
    // MM/DD/YYYY HH:MM:SS
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})$/,
    // MM/DD/YY
    /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/,
    // YYYY-MM-DD
    /^(\d{4})-(\d{2})-(\d{2})$/,
  ];

  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      if (format.source.startsWith('^(\\d{4})')) {
        // ISO format
        return new Date(dateStr);
      }
      
      let [, month, day, year, hour, min, sec] = match;
      
      // Handle 2-digit year
      if (year.length === 2) {
        const yearNum = parseInt(year);
        year = (yearNum > 50 ? '19' : '20') + year;
      }
      
      const date = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hour || '0'),
        parseInt(min || '0'),
        parseInt(sec || '0')
      );
      
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
  }

  // Fallback to Date.parse
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? null : parsed;
}

export function generateImportHash(
  date: Date,
  symbol: string,
  side: string,
  price: number,
  quantity: number
): string {
  const input = `${date.toISOString()}|${symbol}|${side}|${price}|${quantity}`;
  return createHash('sha256').update(input).digest('hex').slice(0, 16);
}

// Group trades by symbol to match entries with exits
export interface GroupedTrades {
  symbol: string;
  entries: ParsedToSTrade[];
  exits: ParsedToSTrade[];
}

export function groupTradesBySymbol(trades: ParsedToSTrade[]): GroupedTrades[] {
  const bySymbol = new Map<string, GroupedTrades>();

  for (const trade of trades) {
    if (!bySymbol.has(trade.symbol)) {
      bySymbol.set(trade.symbol, { symbol: trade.symbol, entries: [], exits: [] });
    }

    const group = bySymbol.get(trade.symbol)!;
    if (trade.isOpening) {
      group.entries.push(trade);
    } else {
      group.exits.push(trade);
    }
  }

  return Array.from(bySymbol.values());
}
