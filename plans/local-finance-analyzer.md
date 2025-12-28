# Local Finance Analyzer - Design Document

> A privacy-first, local personal finance CLI tool with AI-powered transaction categorization and HTML reports.

## Design Decisions

| Decision | Choice |
|----------|--------|
| **Interface** | CLI with HTML report generation |
| **AI Provider** | Ollama (local) + Anthropic/Gemini (remote API options) |
| **Feature Scope** | Full feature set from v1 |
| **Target Banks** | Bank of America, Chase, Charles Schwab, Fidelity |
| **Database** | SQLite (portable, single file) |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Local Finance Analyzer                    │
│                         CLI Tool                             │
├─────────────────────────────────────────────────────────────┤
│  Commands:                                                   │
│  - finance import <csv>     Import transactions              │
│  - finance list             View/search transactions         │
│  - finance categorize       AI categorization                │
│  - finance recurring        Manage subscriptions             │
│  - finance report           Generate HTML reports            │
│  - finance config           Settings & bank profiles         │
├─────────────────────────────────────────────────────────────┤
│                     Core TypeScript Library                  │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐ │
│  │ CSV Parser   │ │ Categorizer  │ │ Report Generator     │ │
│  │ + Bank       │ │ + Rules      │ │ + HTML Templates     │ │
│  │   Adapters   │ │ + AI Client  │ │ + Charts (Chart.js)  │ │
│  └──────────────┘ └──────────────┘ └──────────────────────┘ │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐ │
│  │ Transaction  │ │ Recurring    │ │ Insights Engine      │ │
│  │ Store        │ │ Detector     │ │ + Anomaly Detection  │ │
│  └──────────────┘ └──────────────┘ └──────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  SQLite Database              │  AI Providers               │
│  ~/.local-finance/data.db     │  - Ollama (localhost)       │
│                               │  - Anthropic API            │
│                               │  - Google Gemini API        │
└─────────────────────────────────────────────────────────────┘
```

---

## Bank Profiles

### Supported Banks (v1)

#### Bank of America
```typescript
{
  id: 'bofa',
  name: 'Bank of America',
  patterns: [
    { headers: ['Date', 'Description', 'Amount', 'Running Bal.'] },
    { headers: ['Posted Date', 'Reference Number', 'Payee', 'Address', 'Amount'] }
  ],
  columnMapping: {
    date: 'Date',
    description: 'Description',
    amount: 'Amount'
  },
  dateFormat: 'MM/DD/YYYY',
  amountFormat: { negativeIndicator: 'prefix' }
}
```

#### Chase
```typescript
{
  id: 'chase',
  name: 'Chase',
  patterns: [
    { headers: ['Transaction Date', 'Post Date', 'Description', 'Category', 'Type', 'Amount'] },
    { headers: ['Transaction Date', 'Post Date', 'Description', 'Category', 'Type', 'Amount', 'Memo'] }
  ],
  columnMapping: {
    date: 'Transaction Date',
    description: 'Description',
    amount: 'Amount',
    category: 'Category' // Chase provides their own categories
  },
  dateFormat: 'MM/DD/YYYY'
}
```

#### Charles Schwab
```typescript
{
  id: 'schwab',
  name: 'Charles Schwab',
  patterns: [
    { headers: ['Date', 'Action', 'Symbol', 'Description', 'Quantity', 'Price', 'Fees & Comm', 'Amount'] }, // Brokerage
    { headers: ['Date', 'Type', 'Check #', 'Description', 'Withdrawal', 'Deposit', 'Balance'] } // Checking
  ],
  columnMapping: {
    date: 'Date',
    description: 'Description',
    debit: 'Withdrawal',
    credit: 'Deposit'
  },
  dateFormat: 'MM/DD/YYYY'
}
```

#### Fidelity
```typescript
{
  id: 'fidelity',
  name: 'Fidelity',
  patterns: [
    { headers: ['Run Date', 'Action', 'Symbol', 'Description', 'Type', 'Quantity', 'Price', 'Commission', 'Fees', 'Accrued Interest', 'Amount', 'Settlement Date'] },
    { headers: ['Date', 'Transaction', 'Name', 'Memo', 'Amount'] } // Cash Management
  ],
  columnMapping: {
    date: 'Date',
    description: 'Name',
    amount: 'Amount'
  },
  dateFormat: 'MM/DD/YYYY'
}
```

---

## AI Integration

### Multi-Provider Architecture

```typescript
interface AIProvider {
  name: string;
  categorize(transaction: Transaction, categories: Category[]): Promise<CategoryResult>;
  normalizeMerchant(description: string): Promise<string>;
  generateInsights(summary: SpendingSummary): Promise<string[]>;
}

// Implementations
class OllamaProvider implements AIProvider { /* Local LLM */ }
class AnthropicProvider implements AIProvider { /* Claude API */ }
class GeminiProvider implements AIProvider { /* Google AI */ }
```

### Configuration

```typescript
// ~/.local-finance/config.json
{
  "ai": {
    "provider": "ollama", // or "anthropic", "gemini"
    "ollama": {
      "host": "http://localhost:11434",
      "model": "llama3.2:3b"
    },
    "anthropic": {
      "apiKey": "${ANTHROPIC_API_KEY}", // Env var reference
      "model": "claude-3-haiku-20240307"
    },
    "gemini": {
      "apiKey": "${GOOGLE_AI_API_KEY}",
      "model": "gemini-1.5-flash"
    }
  }
}
```

### Use Cases

1. **Transaction Categorization**
   - Rule-based matching first (fast, predictable)
   - AI for uncertain cases
   - Confidence scoring

2. **Merchant Normalization**
   - Clean up messy bank descriptions
   - "AMAZON.COM*1A2B3C4D5" → "Amazon"

3. **Spending Insights**
   - Monthly summaries
   - Anomaly detection
   - Trend analysis

4. **Recurring Detection Enhancement**
   - Pattern recognition for subscriptions
   - Identify hidden recurring charges

---

## HTML Report Generation

### Report Types

#### 1. Year Summary Report (`report-2024.html`)
- Total income/expenses/net
- Category breakdown with charts
- Monthly trends
- Top merchants
- Recurring payments summary
- AI-generated insights

#### 2. Monthly Report (`report-2024-12.html`)
- Daily spending chart
- Category breakdown
- Notable transactions
- Comparison to previous months

#### 3. Recurring Payments Report (`recurring.html`)
- All detected subscriptions
- Active vs inactive status
- Monthly/yearly cost totals
- Recommendations

### HTML Template Architecture

```
src/
├── templates/
│   ├── base.html           # Base layout with Chart.js
│   ├── year-summary.html   # Year report template
│   ├── monthly.html        # Monthly report template
│   ├── recurring.html      # Subscriptions report
│   └── partials/
│       ├── header.html
│       ├── category-chart.html
│       ├── transaction-table.html
│       └── insights.html
```

### Styling
- Self-contained CSS (no external dependencies)
- Dark/light mode support
- Print-friendly styles
- Responsive design
- Chart.js for visualizations (embedded)

---

## CLI Commands

### `finance import <file>`
```bash
# Import with auto-detection
finance import ~/Downloads/chase-statement.csv

# Import with explicit bank profile
finance import ~/Downloads/statement.csv --bank=bofa

# Import to specific account
finance import statement.csv --account="Chase Checking"

# Dry run (preview without saving)
finance import statement.csv --dry-run
```

### `finance list`
```bash
# List recent transactions
finance list

# Filter by date range
finance list --from=2024-01-01 --to=2024-12-31

# Filter by category
finance list --category=groceries

# Search descriptions
finance list --search="amazon"

# Filter by account
finance list --account="Chase Checking"

# Output formats
finance list --format=table   # (default)
finance list --format=json
finance list --format=csv
```

### `finance categorize`
```bash
# Categorize uncategorized transactions
finance categorize

# Re-categorize all with AI
finance categorize --all --force

# Interactive mode
finance categorize --interactive

# Use specific AI provider
finance categorize --provider=anthropic
```

### `finance recurring`
```bash
# List all recurring payments
finance recurring list

# Detect new recurring patterns
finance recurring detect

# Mark subscription as inactive
finance recurring deactivate "Netflix"

# Add manual recurring payment
finance recurring add --merchant="Gym" --amount=50 --frequency=monthly
```

### `finance report`
```bash
# Generate year summary
finance report --year=2024

# Generate monthly report
finance report --month=2024-12

# Generate recurring payments report
finance report --recurring

# Generate all reports
finance report --all

# Open report after generation
finance report --year=2024 --open
```

### `finance config`
```bash
# Interactive configuration
finance config

# Set AI provider
finance config set ai.provider anthropic

# Add bank profile
finance config add-bank

# List accounts
finance config accounts

# Set data directory
finance config set dataDir ~/Documents/finance
```

---

## Database Schema

```sql
-- Accounts
CREATE TABLE accounts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  institution TEXT NOT NULL, -- bofa, chase, schwab, fidelity
  type TEXT NOT NULL,        -- checking, savings, credit, brokerage
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Transactions
CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES accounts(id),
  date DATE NOT NULL,
  description TEXT NOT NULL,
  normalized_merchant TEXT,
  amount DECIMAL(10,2) NOT NULL,
  category_id TEXT REFERENCES categories(id),
  category_source TEXT,       -- rule, ai, manual
  category_confidence REAL,
  is_recurring INTEGER DEFAULT 0,
  recurring_id TEXT REFERENCES recurring_payments(id),
  notes TEXT,
  raw_csv_row TEXT,           -- Original data for reference
  import_hash TEXT UNIQUE,    -- Deduplication
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME
);

-- Categories (hierarchical)
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  parent_id TEXT REFERENCES categories(id),
  icon TEXT,
  color TEXT,
  is_income INTEGER DEFAULT 0,
  is_system INTEGER DEFAULT 1,  -- Built-in vs user-created
  sort_order INTEGER DEFAULT 0
);

-- Categorization Rules
CREATE TABLE categorization_rules (
  id TEXT PRIMARY KEY,
  pattern TEXT NOT NULL,
  match_type TEXT NOT NULL,   -- contains, regex, exact
  category_id TEXT NOT NULL REFERENCES categories(id),
  priority INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Recurring Payments
CREATE TABLE recurring_payments (
  id TEXT PRIMARY KEY,
  merchant TEXT NOT NULL,
  normalized_merchant TEXT,
  category_id TEXT REFERENCES categories(id),
  frequency TEXT NOT NULL,    -- weekly, biweekly, monthly, quarterly, yearly
  expected_amount DECIMAL(10,2),
  amount_variance DECIMAL(10,2),
  is_active INTEGER DEFAULT 1,
  last_seen DATE,
  next_expected DATE,
  notes TEXT,
  status TEXT DEFAULT 'keep', -- keep, cancel, review
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME
);

-- AI Cache (avoid re-processing)
CREATE TABLE ai_cache (
  id TEXT PRIMARY KEY,
  input_hash TEXT UNIQUE NOT NULL,
  provider TEXT NOT NULL,
  operation TEXT NOT NULL,    -- categorize, normalize, insights
  result TEXT NOT NULL,       -- JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Import History
CREATE TABLE imports (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  bank_profile TEXT,
  account_id TEXT REFERENCES accounts(id),
  row_count INTEGER,
  imported_count INTEGER,
  skipped_count INTEGER,      -- Duplicates
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_transactions_merchant ON transactions(normalized_merchant);
CREATE INDEX idx_transactions_account ON transactions(account_id);
CREATE INDEX idx_transactions_import_hash ON transactions(import_hash);
CREATE INDEX idx_ai_cache_hash ON ai_cache(input_hash);
```

---

## Default Categories

```typescript
const categories = [
  // Income
  { id: 'income', name: 'Income', isIncome: true, children: [
    { id: 'salary', name: 'Salary' },
    { id: 'freelance', name: 'Freelance/Contract' },
    { id: 'investments', name: 'Investment Income' },
    { id: 'refunds', name: 'Refunds & Rebates' },
    { id: 'other-income', name: 'Other Income' },
  ]},

  // Fixed Expenses
  { id: 'housing', name: 'Housing', children: [
    { id: 'rent-mortgage', name: 'Rent/Mortgage' },
    { id: 'utilities', name: 'Utilities' },
    { id: 'internet', name: 'Internet/Phone' },
    { id: 'insurance-home', name: 'Home/Renters Insurance' },
    { id: 'property-tax', name: 'Property Tax' },
    { id: 'maintenance', name: 'Home Maintenance' },
  ]},

  // Transportation
  { id: 'transportation', name: 'Transportation', children: [
    { id: 'gas', name: 'Gas/Fuel' },
    { id: 'car-payment', name: 'Car Payment' },
    { id: 'car-insurance', name: 'Car Insurance' },
    { id: 'parking', name: 'Parking' },
    { id: 'public-transit', name: 'Public Transit' },
    { id: 'rideshare', name: 'Uber/Lyft' },
    { id: 'car-maintenance', name: 'Car Maintenance' },
  ]},

  // Food
  { id: 'food', name: 'Food & Dining', children: [
    { id: 'groceries', name: 'Groceries' },
    { id: 'restaurants', name: 'Restaurants' },
    { id: 'coffee', name: 'Coffee Shops' },
    { id: 'food-delivery', name: 'Food Delivery' },
    { id: 'alcohol-bars', name: 'Alcohol & Bars' },
  ]},

  // Subscriptions
  { id: 'subscriptions', name: 'Subscriptions', children: [
    { id: 'streaming', name: 'Streaming Services' },
    { id: 'software', name: 'Software/Apps' },
    { id: 'news-media', name: 'News & Media' },
    { id: 'memberships', name: 'Memberships' },
    { id: 'cloud-storage', name: 'Cloud Storage' },
  ]},

  // Shopping
  { id: 'shopping', name: 'Shopping', children: [
    { id: 'amazon', name: 'Amazon' },
    { id: 'clothing', name: 'Clothing' },
    { id: 'electronics', name: 'Electronics' },
    { id: 'home-goods', name: 'Home Goods' },
    { id: 'general-shopping', name: 'General Shopping' },
  ]},

  // Health
  { id: 'health', name: 'Health & Fitness', children: [
    { id: 'medical', name: 'Medical' },
    { id: 'pharmacy', name: 'Pharmacy' },
    { id: 'health-insurance', name: 'Health Insurance' },
    { id: 'gym', name: 'Gym/Fitness' },
    { id: 'personal-care', name: 'Personal Care' },
  ]},

  // Entertainment
  { id: 'entertainment', name: 'Entertainment', children: [
    { id: 'events', name: 'Events/Concerts' },
    { id: 'movies', name: 'Movies/Theater' },
    { id: 'games', name: 'Games' },
    { id: 'hobbies', name: 'Hobbies' },
    { id: 'books', name: 'Books' },
  ]},

  // Travel
  { id: 'travel', name: 'Travel', children: [
    { id: 'flights', name: 'Flights' },
    { id: 'hotels', name: 'Hotels/Lodging' },
    { id: 'rental-cars', name: 'Rental Cars' },
    { id: 'travel-other', name: 'Other Travel' },
  ]},

  // Personal
  { id: 'personal', name: 'Personal', children: [
    { id: 'education', name: 'Education' },
    { id: 'gifts', name: 'Gifts' },
    { id: 'donations', name: 'Donations/Charity' },
    { id: 'pets', name: 'Pets' },
    { id: 'kids', name: 'Kids/Family' },
  ]},

  // Financial
  { id: 'financial', name: 'Financial', children: [
    { id: 'transfers', name: 'Transfers' },
    { id: 'fees', name: 'Bank Fees' },
    { id: 'interest', name: 'Interest Charges' },
    { id: 'taxes', name: 'Taxes' },
    { id: 'investments-out', name: 'Investment Contributions' },
    { id: 'savings', name: 'Savings' },
  ]},

  // Uncategorized
  { id: 'uncategorized', name: 'Uncategorized' },
];
```

---

## Technical Stack

```json
{
  "name": "@hudak/local-finance",
  "version": "1.0.0",
  "type": "module",
  "bin": {
    "finance": "./dist/cli.js"
  },
  "dependencies": {
    "better-sqlite3": "^11.6.0",
    "csv-parse": "^5.6.0",
    "date-fns": "^4.1.0",
    "commander": "^12.1.0",
    "chalk": "^5.3.0",
    "ora": "^8.1.0",
    "inquirer": "^12.1.0",
    "ollama": "^0.5.11",
    "@anthropic-ai/sdk": "^0.32.1",
    "@google/generative-ai": "^0.21.0",
    "handlebars": "^4.7.8",
    "open": "^10.1.0",
    "nanoid": "^5.0.9"
  },
  "devDependencies": {
    "@types/better-sqlite3": "^7.6.12",
    "@types/inquirer": "^9.0.7",
    "@tools/eslint-config": "*",
    "@tools/typescript-config": "*",
    "typescript": "^5.9.3",
    "tsup": "^8.3.5",
    "vitest": "^2.1.8"
  }
}
```

---

## File Structure

```
apps/local-finance/
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── README.md
├── src/
│   ├── cli.ts                    # CLI entry point
│   ├── commands/
│   │   ├── import.ts
│   │   ├── list.ts
│   │   ├── categorize.ts
│   │   ├── recurring.ts
│   │   ├── report.ts
│   │   └── config.ts
│   ├── core/
│   │   ├── database.ts           # SQLite operations
│   │   ├── schema.ts             # Schema & migrations
│   │   ├── config.ts             # Configuration management
│   │   └── types.ts              # TypeScript types
│   ├── import/
│   │   ├── csv-parser.ts
│   │   ├── bank-detector.ts
│   │   └── profiles/
│   │       ├── bofa.ts
│   │       ├── chase.ts
│   │       ├── schwab.ts
│   │       └── fidelity.ts
│   ├── categorization/
│   │   ├── rule-engine.ts
│   │   ├── default-rules.ts
│   │   └── ai/
│   │       ├── provider.ts       # AI provider interface
│   │       ├── ollama.ts
│   │       ├── anthropic.ts
│   │       └── gemini.ts
│   ├── recurring/
│   │   ├── detector.ts
│   │   └── analyzer.ts
│   ├── reports/
│   │   ├── generator.ts
│   │   ├── templates/
│   │   │   ├── base.hbs
│   │   │   ├── year-summary.hbs
│   │   │   ├── monthly.hbs
│   │   │   └── recurring.hbs
│   │   └── assets/
│   │       ├── styles.css
│   │       └── chart.min.js      # Bundled Chart.js
│   └── insights/
│       └── engine.ts
└── tests/
    ├── import.test.ts
    ├── categorize.test.ts
    └── fixtures/
        ├── bofa-sample.csv
        ├── chase-sample.csv
        ├── schwab-sample.csv
        └── fidelity-sample.csv
```

---

## Implementation Checklist

### Phase 1: Foundation
- [ ] Project setup (package.json, tsconfig, tsup)
- [ ] SQLite database with schema migrations
- [ ] Configuration system
- [ ] Base CLI structure with commander

### Phase 2: Import
- [ ] CSV parser with flexible column mapping
- [ ] Bank profile detection
- [ ] Bank of America profile
- [ ] Chase profile
- [ ] Charles Schwab profile
- [ ] Fidelity profile
- [ ] Deduplication logic
- [ ] Account management

### Phase 3: Categorization
- [ ] Category system with hierarchy
- [ ] Rule-based categorization engine
- [ ] Default categorization rules
- [ ] AI provider interface
- [ ] Ollama integration
- [ ] Anthropic integration
- [ ] Gemini integration
- [ ] AI caching layer
- [ ] Merchant normalization

### Phase 4: Recurring Detection
- [ ] Frequency analysis algorithm
- [ ] Subscription pattern matching
- [ ] Active/inactive detection
- [ ] Recurring payment management CLI

### Phase 5: Reports
- [ ] Handlebars template system
- [ ] Year summary report
- [ ] Monthly report
- [ ] Recurring payments report
- [ ] Chart.js integration
- [ ] CSS styling (dark/light mode)
- [ ] Auto-open generated reports

### Phase 6: Insights
- [ ] AI-powered spending insights
- [ ] Anomaly detection
- [ ] Trend analysis
- [ ] Budget recommendations

---

## Privacy & Security

- **Local-first**: All data stored in `~/.local-finance/`
- **API keys**: Stored in config, referenced via env vars
- **No telemetry**: Zero external data collection
- **Portable**: Single SQLite file for backup/migration
- **Optional cloud AI**: User chooses whether to use remote APIs
