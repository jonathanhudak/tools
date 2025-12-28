# Local Finance Analyzer

A privacy-first, local-only personal finance CLI tool with AI-powered transaction categorization and HTML reports.

## Features

- **CSV Import**: Import transactions from Bank of America, Chase, Charles Schwab, and Fidelity
- **AI Categorization**: Automatically categorize transactions using Ollama, Anthropic, or Google Gemini
- **Recurring Detection**: Identify subscriptions and recurring payments
- **HTML Reports**: Generate beautiful year summaries with charts and insights
- **100% Local**: All data stays on your machine in a SQLite database

## Installation

```bash
# From the monorepo root
npm install

# Build the CLI
npm run build -w @hudak/local-finance

# Link for global access (optional)
npm link -w @hudak/local-finance
```

## Quick Start

```bash
# 1. Import your bank transactions
finance import ~/Downloads/chase-statement.csv

# 2. Initialize categorization rules and categorize transactions
finance categorize --init-rules

# 3. Detect recurring payments
finance recurring detect --save

# 4. Generate a year summary report
finance report --year=2024 --open
```

## Commands

### `finance import <file>`

Import transactions from a CSV file.

```bash
# Auto-detect bank format
finance import statement.csv

# Specify bank profile
finance import statement.csv --bank=chase

# Specify account name
finance import statement.csv --account="Chase Checking"

# Preview without saving
finance import statement.csv --dry-run

# List supported banks
finance import --list-banks
```

### `finance list`

View and search transactions.

```bash
# List recent transactions
finance list

# Filter by date range
finance list --from=2024-01-01 --to=2024-12-31

# Filter by category
finance list --category=groceries

# Search descriptions
finance list --search="amazon"

# Show only uncategorized
finance list --uncategorized

# Output formats
finance list --format=json
finance list --format=csv
```

### `finance categorize`

Categorize transactions using rules and AI.

```bash
# Categorize uncategorized transactions
finance categorize

# Initialize default rules first
finance categorize --init-rules

# Re-categorize all transactions
finance categorize --all --force

# Interactive mode
finance categorize --interactive

# Use specific AI provider
finance categorize --provider=anthropic

# Also normalize merchant names
finance categorize --normalize

# Rules only (no AI)
finance categorize --rules-only
```

### `finance recurring`

Manage recurring payments and subscriptions.

```bash
# List all recurring payments
finance recurring list
finance recurring list --active
finance recurring list --inactive

# Detect recurring patterns
finance recurring detect --year=2024
finance recurring detect --save

# Deactivate a subscription
finance recurring deactivate "Netflix"

# Manually add a recurring payment
finance recurring add --merchant="Gym" --amount=50 --frequency=monthly
```

### `finance report`

Generate HTML financial reports.

```bash
# Generate year summary
finance report --year=2024

# Generate and open in browser
finance report --year=2024 --open

# Generate recurring payments report
finance report --recurring

# Generate all reports
finance report --all

# Skip AI insights
finance report --year=2024 --no-ai
```

### `finance config`

Manage configuration.

```bash
# Show current config
finance config show

# Interactive setup
finance config init

# Set AI provider
finance config set ai.provider anthropic
finance config set ai.anthropic.apiKey sk-...

# List accounts
finance config accounts

# Show data directory
finance config path
```

## AI Configuration

### Ollama (Local - Default)

```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull a model
ollama pull llama3.2:3b

# Configure
finance config set ai.provider ollama
finance config set ai.ollama.model llama3.2:3b
```

### Anthropic (Claude)

```bash
# Set API key via environment variable
export ANTHROPIC_API_KEY=sk-...

# Or configure directly
finance config set ai.provider anthropic
finance config set ai.anthropic.apiKey '${ANTHROPIC_API_KEY}'
```

### Google Gemini

```bash
# Set API key via environment variable
export GOOGLE_AI_API_KEY=...

# Or configure directly
finance config set ai.provider gemini
finance config set ai.gemini.apiKey '${GOOGLE_AI_API_KEY}'
```

## Supported Banks

| Bank | Profile IDs |
|------|-------------|
| Bank of America | `bofa`, `bofa-credit` |
| Chase | `chase`, `chase-checking` |
| Charles Schwab | `schwab-checking`, `schwab-brokerage` |
| Fidelity | `fidelity-cash`, `fidelity-brokerage`, `fidelity-credit` |

## Data Storage

All data is stored locally in `~/.local-finance/`:

```
~/.local-finance/
├── config.json    # Configuration
├── data.db        # SQLite database
└── reports/       # Generated HTML reports
```

## Privacy

- **No cloud sync**: All data stays on your machine
- **No telemetry**: Zero data collection or analytics
- **Local AI option**: Use Ollama for 100% offline AI
- **Portable**: Single SQLite file for easy backup

## Development

```bash
# Development mode with watch
npm run dev -w @hudak/local-finance

# Type checking
npm run typecheck -w @hudak/local-finance

# Build
npm run build -w @hudak/local-finance
```

## License

ISC
