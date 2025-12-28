// CSV parsing with bank profile support

import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { createHash } from 'crypto';
import { parse as parseDate, isValid } from 'date-fns';
import type { BankProfile, ParsedTransaction, ColumnMapping } from '../core/types.js';
import { detectBankProfile } from './bank-detector.js';
import { getProfileById } from './profiles/index.js';

export interface ParseOptions {
  bankProfileId?: string;
  accountId?: string;
}

export interface ParseResult {
  transactions: ParsedTransaction[];
  detectedProfile: BankProfile | null;
  errors: string[];
  totalRows: number;
}

export function parseCSVFile(filePath: string, options: ParseOptions = {}): ParseResult {
  const content = fs.readFileSync(filePath, 'utf-8');
  return parseCSVContent(content, options);
}

export function parseCSVContent(content: string, options: ParseOptions = {}): ParseResult {
  const errors: string[] = [];
  const transactions: ParsedTransaction[] = [];

  // Parse CSV
  let records: Record<string, string>[];
  try {
    records = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
    });
  } catch (err) {
    return {
      transactions: [],
      detectedProfile: null,
      errors: [`Failed to parse CSV: ${err instanceof Error ? err.message : 'Unknown error'}`],
      totalRows: 0,
    };
  }

  if (records.length === 0) {
    return {
      transactions: [],
      detectedProfile: null,
      errors: ['CSV file is empty or has no data rows'],
      totalRows: 0,
    };
  }

  // Get headers from first record
  const headers = Object.keys(records[0]);

  // Detect or use specified profile
  let profile: BankProfile | null = null;

  if (options.bankProfileId) {
    profile = getProfileById(options.bankProfileId) ?? null;
    if (!profile) {
      errors.push(`Unknown bank profile: ${options.bankProfileId}`);
    }
  }

  if (!profile) {
    const detection = detectBankProfile(headers);
    if (detection && detection.confidence >= 0.5) {
      profile = detection.profile;
    } else {
      errors.push('Could not detect bank format. Please specify --bank option.');
      return {
        transactions: [],
        detectedProfile: null,
        errors,
        totalRows: records.length,
      };
    }
  }

  // Parse each row
  for (let i = 0; i < records.length; i++) {
    const row = records[i];
    const rowNum = i + 2; // +2 because of header row and 1-indexing

    try {
      const parsed = parseRow(row, profile, rowNum);
      if (parsed) {
        transactions.push(parsed);
      }
    } catch (err) {
      errors.push(`Row ${rowNum}: ${err instanceof Error ? err.message : 'Parse error'}`);
    }
  }

  return {
    transactions,
    detectedProfile: profile,
    errors,
    totalRows: records.length,
  };
}

function parseRow(
  row: Record<string, string>,
  profile: BankProfile,
  rowNum: number
): ParsedTransaction | null {
  const mapping = profile.columnMapping;

  // Get date
  const dateStr = getColumnValue(row, mapping.date);
  if (!dateStr) {
    throw new Error('Missing date');
  }

  const date = parseTransactionDate(dateStr, profile.dateFormat);
  if (!date) {
    throw new Error(`Invalid date: ${dateStr}`);
  }

  // Get description
  const description = getColumnValue(row, mapping.description);
  if (!description) {
    throw new Error('Missing description');
  }

  // Get amount
  let amount: number;

  if (mapping.amount) {
    const amountStr = getColumnValue(row, mapping.amount);
    if (!amountStr) {
      throw new Error('Missing amount');
    }
    amount = parseAmount(amountStr, profile.amountFormat);
  } else if (mapping.debit !== undefined && mapping.credit !== undefined) {
    // Handle separate debit/credit columns
    const debitStr = getColumnValue(row, mapping.debit);
    const creditStr = getColumnValue(row, mapping.credit);

    const debit = debitStr ? parseAmount(debitStr, profile.amountFormat) : 0;
    const credit = creditStr ? parseAmount(creditStr, profile.amountFormat) : 0;

    // Debit is negative (money out), credit is positive (money in)
    amount = credit - Math.abs(debit);
  } else {
    throw new Error('No amount mapping configured');
  }

  // Skip zero-amount transactions (often balance entries)
  if (amount === 0) {
    return null;
  }

  return {
    date,
    description,
    amount,
    rawRow: row,
  };
}

function getColumnValue(
  row: Record<string, string>,
  key: string | number | undefined
): string | null {
  if (key === undefined) {
    return null;
  }

  if (typeof key === 'number') {
    const keys = Object.keys(row);
    if (key >= 0 && key < keys.length) {
      return row[keys[key]] || null;
    }
    return null;
  }

  // Try exact match first
  if (row[key] !== undefined) {
    return row[key] || null;
  }

  // Try case-insensitive match
  const lowerKey = key.toLowerCase();
  for (const [k, v] of Object.entries(row)) {
    if (k.toLowerCase() === lowerKey) {
      return v || null;
    }
  }

  return null;
}

function parseTransactionDate(dateStr: string, format: string): Date | null {
  // Common date formats to try
  const formats = [
    format,
    'MM/dd/yyyy',
    'MM/dd/yy',
    'yyyy-MM-dd',
    'M/d/yyyy',
    'M/d/yy',
    'dd/MM/yyyy',
  ];

  for (const fmt of formats) {
    try {
      const parsed = parseDate(dateStr, fmt, new Date());
      if (isValid(parsed)) {
        return parsed;
      }
    } catch {
      // Try next format
    }
  }

  // Last resort: try native Date parsing
  const nativeParsed = new Date(dateStr);
  if (isValid(nativeParsed)) {
    return nativeParsed;
  }

  return null;
}

function parseAmount(amountStr: string, format?: BankProfile['amountFormat']): number {
  let cleaned = amountStr.trim();

  // Handle parentheses for negative
  if (format?.negativeIndicator === 'parentheses' || cleaned.match(/^\(.*\)$/)) {
    if (cleaned.startsWith('(') && cleaned.endsWith(')')) {
      cleaned = '-' + cleaned.slice(1, -1);
    }
  }

  // Remove currency symbols
  cleaned = cleaned.replace(/[$£€¥]/g, '');

  // Handle thousand separators
  const thousandsSep = format?.thousandsSeparator ?? ',';
  if (thousandsSep) {
    cleaned = cleaned.replace(new RegExp(`\\${thousandsSep}`, 'g'), '');
  }

  // Handle decimal separator
  const decimalSep = format?.decimalSeparator ?? '.';
  if (decimalSep !== '.') {
    cleaned = cleaned.replace(decimalSep, '.');
  }

  // Remove any remaining non-numeric chars except - and .
  cleaned = cleaned.replace(/[^\d.\-]/g, '');

  const amount = parseFloat(cleaned);

  if (isNaN(amount)) {
    throw new Error(`Invalid amount: ${amountStr}`);
  }

  return amount;
}

export function generateImportHash(
  date: Date,
  description: string,
  amount: number,
  accountId: string
): string {
  const data = `${date.toISOString().split('T')[0]}|${description}|${amount.toFixed(2)}|${accountId}`;
  return createHash('sha256').update(data).digest('hex').substring(0, 16);
}
