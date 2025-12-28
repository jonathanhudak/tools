// Database schema and migrations

export const SCHEMA_VERSION = 1;

export const CREATE_TABLES = `
-- Schema version tracking
CREATE TABLE IF NOT EXISTS schema_version (
  version INTEGER PRIMARY KEY
);

-- Accounts
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  institution TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('checking', 'savings', 'credit', 'brokerage')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Categories (hierarchical)
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  parent_id TEXT REFERENCES categories(id),
  icon TEXT,
  color TEXT,
  is_income INTEGER DEFAULT 0,
  is_system INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES accounts(id),
  date DATE NOT NULL,
  description TEXT NOT NULL,
  normalized_merchant TEXT,
  amount REAL NOT NULL,
  category_id TEXT REFERENCES categories(id),
  category_source TEXT CHECK (category_source IN ('rule', 'ai', 'manual')),
  category_confidence REAL,
  is_recurring INTEGER DEFAULT 0,
  recurring_id TEXT REFERENCES recurring_payments(id),
  notes TEXT,
  raw_csv_row TEXT,
  import_hash TEXT UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME
);

-- Categorization Rules
CREATE TABLE IF NOT EXISTS categorization_rules (
  id TEXT PRIMARY KEY,
  pattern TEXT NOT NULL,
  match_type TEXT NOT NULL CHECK (match_type IN ('contains', 'regex', 'exact')),
  category_id TEXT NOT NULL REFERENCES categories(id),
  priority INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Recurring Payments
CREATE TABLE IF NOT EXISTS recurring_payments (
  id TEXT PRIMARY KEY,
  merchant TEXT NOT NULL,
  normalized_merchant TEXT,
  category_id TEXT REFERENCES categories(id),
  frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'biweekly', 'monthly', 'quarterly', 'yearly')),
  expected_amount REAL,
  amount_variance REAL,
  is_active INTEGER DEFAULT 1,
  last_seen DATE,
  next_expected DATE,
  notes TEXT,
  status TEXT DEFAULT 'keep' CHECK (status IN ('keep', 'cancel', 'review')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME
);

-- AI Cache
CREATE TABLE IF NOT EXISTS ai_cache (
  id TEXT PRIMARY KEY,
  input_hash TEXT UNIQUE NOT NULL,
  provider TEXT NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('categorize', 'normalize', 'insights')),
  result TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Import History
CREATE TABLE IF NOT EXISTS imports (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  bank_profile TEXT,
  account_id TEXT REFERENCES accounts(id),
  row_count INTEGER,
  imported_count INTEGER,
  skipped_count INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_merchant ON transactions(normalized_merchant);
CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_import_hash ON transactions(import_hash);
CREATE INDEX IF NOT EXISTS idx_ai_cache_hash ON ai_cache(input_hash);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
`;

export const DEFAULT_CATEGORIES = [
  // Income
  { id: 'income', name: 'Income', parentId: null, isIncome: true, sortOrder: 0 },
  { id: 'salary', name: 'Salary', parentId: 'income', isIncome: true, sortOrder: 1 },
  { id: 'freelance', name: 'Freelance/Contract', parentId: 'income', isIncome: true, sortOrder: 2 },
  { id: 'investments', name: 'Investment Income', parentId: 'income', isIncome: true, sortOrder: 3 },
  { id: 'refunds', name: 'Refunds & Rebates', parentId: 'income', isIncome: true, sortOrder: 4 },
  { id: 'other-income', name: 'Other Income', parentId: 'income', isIncome: true, sortOrder: 5 },

  // Housing
  { id: 'housing', name: 'Housing', parentId: null, isIncome: false, sortOrder: 10 },
  { id: 'rent-mortgage', name: 'Rent/Mortgage', parentId: 'housing', isIncome: false, sortOrder: 11 },
  { id: 'utilities', name: 'Utilities', parentId: 'housing', isIncome: false, sortOrder: 12 },
  { id: 'internet', name: 'Internet/Phone', parentId: 'housing', isIncome: false, sortOrder: 13 },
  { id: 'insurance-home', name: 'Home/Renters Insurance', parentId: 'housing', isIncome: false, sortOrder: 14 },
  { id: 'property-tax', name: 'Property Tax', parentId: 'housing', isIncome: false, sortOrder: 15 },
  { id: 'maintenance', name: 'Home Maintenance', parentId: 'housing', isIncome: false, sortOrder: 16 },

  // Transportation
  { id: 'transportation', name: 'Transportation', parentId: null, isIncome: false, sortOrder: 20 },
  { id: 'gas', name: 'Gas/Fuel', parentId: 'transportation', isIncome: false, sortOrder: 21 },
  { id: 'car-payment', name: 'Car Payment', parentId: 'transportation', isIncome: false, sortOrder: 22 },
  { id: 'car-insurance', name: 'Car Insurance', parentId: 'transportation', isIncome: false, sortOrder: 23 },
  { id: 'parking', name: 'Parking', parentId: 'transportation', isIncome: false, sortOrder: 24 },
  { id: 'public-transit', name: 'Public Transit', parentId: 'transportation', isIncome: false, sortOrder: 25 },
  { id: 'rideshare', name: 'Uber/Lyft', parentId: 'transportation', isIncome: false, sortOrder: 26 },
  { id: 'car-maintenance', name: 'Car Maintenance', parentId: 'transportation', isIncome: false, sortOrder: 27 },

  // Food
  { id: 'food', name: 'Food & Dining', parentId: null, isIncome: false, sortOrder: 30 },
  { id: 'groceries', name: 'Groceries', parentId: 'food', isIncome: false, sortOrder: 31 },
  { id: 'restaurants', name: 'Restaurants', parentId: 'food', isIncome: false, sortOrder: 32 },
  { id: 'coffee', name: 'Coffee Shops', parentId: 'food', isIncome: false, sortOrder: 33 },
  { id: 'food-delivery', name: 'Food Delivery', parentId: 'food', isIncome: false, sortOrder: 34 },
  { id: 'alcohol-bars', name: 'Alcohol & Bars', parentId: 'food', isIncome: false, sortOrder: 35 },

  // Subscriptions
  { id: 'subscriptions', name: 'Subscriptions', parentId: null, isIncome: false, sortOrder: 40 },
  { id: 'streaming', name: 'Streaming Services', parentId: 'subscriptions', isIncome: false, sortOrder: 41 },
  { id: 'software', name: 'Software/Apps', parentId: 'subscriptions', isIncome: false, sortOrder: 42 },
  { id: 'news-media', name: 'News & Media', parentId: 'subscriptions', isIncome: false, sortOrder: 43 },
  { id: 'memberships', name: 'Memberships', parentId: 'subscriptions', isIncome: false, sortOrder: 44 },
  { id: 'cloud-storage', name: 'Cloud Storage', parentId: 'subscriptions', isIncome: false, sortOrder: 45 },

  // Shopping
  { id: 'shopping', name: 'Shopping', parentId: null, isIncome: false, sortOrder: 50 },
  { id: 'amazon', name: 'Amazon', parentId: 'shopping', isIncome: false, sortOrder: 51 },
  { id: 'clothing', name: 'Clothing', parentId: 'shopping', isIncome: false, sortOrder: 52 },
  { id: 'electronics', name: 'Electronics', parentId: 'shopping', isIncome: false, sortOrder: 53 },
  { id: 'home-goods', name: 'Home Goods', parentId: 'shopping', isIncome: false, sortOrder: 54 },
  { id: 'general-shopping', name: 'General Shopping', parentId: 'shopping', isIncome: false, sortOrder: 55 },

  // Health
  { id: 'health', name: 'Health & Fitness', parentId: null, isIncome: false, sortOrder: 60 },
  { id: 'medical', name: 'Medical', parentId: 'health', isIncome: false, sortOrder: 61 },
  { id: 'pharmacy', name: 'Pharmacy', parentId: 'health', isIncome: false, sortOrder: 62 },
  { id: 'health-insurance', name: 'Health Insurance', parentId: 'health', isIncome: false, sortOrder: 63 },
  { id: 'gym', name: 'Gym/Fitness', parentId: 'health', isIncome: false, sortOrder: 64 },
  { id: 'personal-care', name: 'Personal Care', parentId: 'health', isIncome: false, sortOrder: 65 },

  // Entertainment
  { id: 'entertainment', name: 'Entertainment', parentId: null, isIncome: false, sortOrder: 70 },
  { id: 'events', name: 'Events/Concerts', parentId: 'entertainment', isIncome: false, sortOrder: 71 },
  { id: 'movies', name: 'Movies/Theater', parentId: 'entertainment', isIncome: false, sortOrder: 72 },
  { id: 'games', name: 'Games', parentId: 'entertainment', isIncome: false, sortOrder: 73 },
  { id: 'hobbies', name: 'Hobbies', parentId: 'entertainment', isIncome: false, sortOrder: 74 },
  { id: 'books', name: 'Books', parentId: 'entertainment', isIncome: false, sortOrder: 75 },

  // Travel
  { id: 'travel', name: 'Travel', parentId: null, isIncome: false, sortOrder: 80 },
  { id: 'flights', name: 'Flights', parentId: 'travel', isIncome: false, sortOrder: 81 },
  { id: 'hotels', name: 'Hotels/Lodging', parentId: 'travel', isIncome: false, sortOrder: 82 },
  { id: 'rental-cars', name: 'Rental Cars', parentId: 'travel', isIncome: false, sortOrder: 83 },
  { id: 'travel-other', name: 'Other Travel', parentId: 'travel', isIncome: false, sortOrder: 84 },

  // Personal
  { id: 'personal', name: 'Personal', parentId: null, isIncome: false, sortOrder: 90 },
  { id: 'education', name: 'Education', parentId: 'personal', isIncome: false, sortOrder: 91 },
  { id: 'gifts', name: 'Gifts', parentId: 'personal', isIncome: false, sortOrder: 92 },
  { id: 'donations', name: 'Donations/Charity', parentId: 'personal', isIncome: false, sortOrder: 93 },
  { id: 'pets', name: 'Pets', parentId: 'personal', isIncome: false, sortOrder: 94 },
  { id: 'kids', name: 'Kids/Family', parentId: 'personal', isIncome: false, sortOrder: 95 },

  // Financial
  { id: 'financial', name: 'Financial', parentId: null, isIncome: false, sortOrder: 100 },
  { id: 'transfers', name: 'Transfers', parentId: 'financial', isIncome: false, sortOrder: 101 },
  { id: 'fees', name: 'Bank Fees', parentId: 'financial', isIncome: false, sortOrder: 102 },
  { id: 'interest', name: 'Interest Charges', parentId: 'financial', isIncome: false, sortOrder: 103 },
  { id: 'taxes', name: 'Taxes', parentId: 'financial', isIncome: false, sortOrder: 104 },
  { id: 'investments-out', name: 'Investment Contributions', parentId: 'financial', isIncome: false, sortOrder: 105 },
  { id: 'savings', name: 'Savings', parentId: 'financial', isIncome: false, sortOrder: 106 },

  // Uncategorized
  { id: 'uncategorized', name: 'Uncategorized', parentId: null, isIncome: false, sortOrder: 999 },
];

export const INSERT_CATEGORY = `
  INSERT OR IGNORE INTO categories (id, name, parent_id, is_income, is_system, sort_order)
  VALUES (?, ?, ?, ?, 1, ?)
`;
