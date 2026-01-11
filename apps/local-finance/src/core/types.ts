// Core types for Local Finance Analyzer

export interface Account {
  id: string;
  name: string;
  institution: string;
  type: 'checking' | 'savings' | 'credit' | 'brokerage';
  createdAt: Date;
}

export interface Transaction {
  id: string;
  accountId: string;
  date: Date;
  description: string;
  normalizedMerchant: string | null;
  amount: number;
  categoryId: string | null;
  categorySource: 'rule' | 'ai' | 'manual' | null;
  categoryConfidence: number | null;
  isRecurring: boolean;
  recurringId: string | null;
  notes: string | null;
  rawCsvRow: string | null;
  importHash: string;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface Category {
  id: string;
  name: string;
  parentId: string | null;
  icon: string | null;
  color: string | null;
  isIncome: boolean;
  isSystem: boolean;
  sortOrder: number;
}

export interface CategoryWithChildren extends Category {
  children: Category[];
}

export interface CategorizationRule {
  id: string;
  pattern: string;
  matchType: 'contains' | 'regex' | 'exact';
  categoryId: string;
  priority: number;
  isActive: boolean;
  createdAt: Date;
}

export interface RecurringPayment {
  id: string;
  merchant: string;
  normalizedMerchant: string | null;
  categoryId: string | null;
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
  expectedAmount: number | null;
  amountVariance: number | null;
  isActive: boolean;
  lastSeen: Date | null;
  nextExpected: Date | null;
  notes: string | null;
  status: 'keep' | 'cancel' | 'review';
  createdAt: Date;
  updatedAt: Date | null;
}

export interface AICache {
  id: string;
  inputHash: string;
  provider: string;
  operation: 'categorize' | 'normalize' | 'insights';
  result: string;
  createdAt: Date;
}

export interface Import {
  id: string;
  filename: string;
  bankProfile: string | null;
  accountId: string | null;
  rowCount: number;
  importedCount: number;
  skippedCount: number;
  createdAt: Date;
}

// Bank profile types
export interface BankProfile {
  id: string;
  name: string;
  patterns: BankPattern[];
  columnMapping: ColumnMapping;
  dateFormat: string;
  amountFormat?: AmountFormat;
  skipRows?: number;
}

export interface BankPattern {
  headers: string[];
}

export interface ColumnMapping {
  date: string | number;
  description: string | number;
  amount?: string | number;
  debit?: string | number;
  credit?: string | number;
  category?: string | number;
  balance?: string | number;
}

export interface AmountFormat {
  negativeIndicator?: 'prefix' | 'suffix' | 'parentheses';
  decimalSeparator?: '.' | ',';
  thousandsSeparator?: ',' | '.' | ' ' | '';
}

// AI types
export interface AIProvider {
  name: string;
  categorize(
    transaction: { description: string; amount: number },
    categories: Category[]
  ): Promise<CategoryResult>;
  normalizeMerchant(description: string): Promise<string>;
  generateInsights(summary: SpendingSummary): Promise<string[]>;
}

export interface CategoryResult {
  categoryId: string;
  confidence: number;
}

export interface SpendingSummary {
  period: string;
  totalIncome: number;
  totalExpenses: number;
  byCategory: { categoryId: string; categoryName: string; amount: number }[];
  topMerchants: { merchant: string; amount: number; count: number }[];
}

// Report types
export interface YearReport {
  year: number;
  totalIncome: number;
  totalExpenses: number;
  net: number;
  byCategory: CategorySummary[];
  byMonth: MonthSummary[];
  topMerchants: MerchantSummary[];
  recurringPayments: RecurringPaymentSummary[];
  insights: string[];
}

export interface CategorySummary {
  categoryId: string;
  categoryName: string;
  parentName: string | null;
  amount: number;
  percentage: number;
  transactionCount: number;
}

export interface MonthSummary {
  month: number;
  monthName: string;
  income: number;
  expenses: number;
  net: number;
}

export interface MerchantSummary {
  merchant: string;
  amount: number;
  count: number;
  categoryName: string | null;
}

export interface RecurringPaymentSummary {
  merchant: string;
  frequency: string;
  amount: number;
  totalSpent: number;
  occurrences: number;
  isActive: boolean;
  confidence: number;
}

// Config types
export interface Config {
  dataDir: string;
  ai: AIConfig;
  defaultAccount?: string;
}

export interface AIConfig {
  provider: 'ollama' | 'anthropic' | 'gemini';
  ollama?: {
    host: string;
    model: string;
  };
  anthropic?: {
    apiKey: string;
    model: string;
  };
  gemini?: {
    apiKey: string;
    model: string;
  };
}

// CSV parsing types
export interface ParsedTransaction {
  date: Date;
  description: string;
  amount: number;
  rawRow: Record<string, string>;
}

export interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
  transactions: Transaction[];
}
