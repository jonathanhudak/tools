// Database schema for trade journal

export const SCHEMA_VERSION = 1;

export const CREATE_TABLES = `
-- Schema version tracking
CREATE TABLE IF NOT EXISTS schema_version (
  version INTEGER PRIMARY KEY
);

-- Trades table
CREATE TABLE IF NOT EXISTS trades (
  id TEXT PRIMARY KEY,
  symbol TEXT NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('long', 'short')),
  asset_type TEXT NOT NULL DEFAULT 'stock' CHECK (asset_type IN ('stock', 'option', 'futures', 'forex', 'crypto')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  
  -- Entry
  entry_price REAL NOT NULL,
  entry_date TEXT NOT NULL,
  entry_quantity REAL NOT NULL,
  
  -- Exit
  exit_price REAL,
  exit_date TEXT,
  exit_quantity REAL,
  
  -- Calculated
  pnl REAL,
  pnl_percent REAL,
  
  -- Risk management
  stop_loss REAL,
  take_profit REAL,
  risk_reward_ratio REAL,
  
  -- Fees
  commission REAL NOT NULL DEFAULT 0,
  fees REAL NOT NULL DEFAULT 0,
  
  -- Metadata
  notes TEXT,
  strategy TEXT,
  tags TEXT, -- JSON array
  
  -- Import tracking
  import_hash TEXT UNIQUE,
  import_source TEXT,
  
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT
);

-- Imports table
CREATE TABLE IF NOT EXISTS imports (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  source TEXT NOT NULL,
  row_count INTEGER NOT NULL,
  imported_count INTEGER NOT NULL,
  skipped_count INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_trades_symbol ON trades(symbol);
CREATE INDEX IF NOT EXISTS idx_trades_entry_date ON trades(entry_date);
CREATE INDEX IF NOT EXISTS idx_trades_status ON trades(status);
CREATE INDEX IF NOT EXISTS idx_trades_side ON trades(side);
CREATE INDEX IF NOT EXISTS idx_trades_import_hash ON trades(import_hash);
`;
