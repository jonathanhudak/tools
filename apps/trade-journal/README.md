# Trade Journal CLI

A local-first trading journal CLI for logging trades, calculating statistics, and generating reports.

## Features

- 📝 **Manual Trade Logging** - Log trades with entry/exit prices, quantities, and more
- 📥 **Import from ThinkorSwim** - Parse and import trades from TD Ameritrade/Schwab CSV exports
- 📊 **Statistics** - Win rate, P&L, profit factor, R:R ratio, streaks, and more
- 📈 **HTML Reports** - Generate beautiful HTML reports for any time period
- 🔒 **Local-first** - All data stored locally in SQLite - your data stays on your machine

## Installation

```bash
# From the monorepo root
pnpm install
pnpm --filter @hudak/trade-journal build

# Add to PATH (optional)
npm link ./apps/trade-journal
```

## Usage

### Log a Trade

```bash
# Log a closed trade
trade log TSLA --side long --entry 280.50 --exit 285.00 --shares 100

# Log an open position with risk levels
trade log SPY --side short --entry 450.00 --shares 100 --stop 455 --target 440

# Log with notes and strategy
trade log AAPL --side long --entry 175 --exit 180 --shares 50 \
  --strategy "gap-and-go" --notes "Strong pre-market volume"
```

### Import from ThinkorSwim

```bash
# Import trades from ThinkorSwim CSV export
trade import ~/Downloads/tos-trades.csv

# Preview import without saving
trade import trades.csv --dry-run
```

### View Statistics

```bash
# All-time stats
trade stats

# Weekly stats with symbol breakdown
trade stats --period week --by-symbol

# Monthly stats with daily breakdown
trade stats --period month --daily

# Custom date range
trade stats --from 2024-01-01 --to 2024-01-31
```

### Generate Reports

```bash
# Generate report for current month
trade report

# Generate report for specific month
trade report --month january --year 2024

# Generate and open in browser
trade report --month january --open

# Custom date range
trade report --from 2024-01-01 --to 2024-03-31 --output q1-report.html
```

### List Trades

```bash
# List recent trades
trade list

# Filter by symbol
trade list --symbol TSLA

# Filter by status
trade list --status open

# Combine filters
trade list --symbol TSLA --side long --limit 50
```

## Statistics Tracked

| Metric | Description |
|--------|-------------|
| Win Rate | Percentage of winning trades |
| Total P&L | Net profit/loss |
| Gross Profit | Sum of all winning trades |
| Gross Loss | Sum of all losing trades |
| Profit Factor | Gross Profit / Gross Loss |
| Expectancy | Average P&L per trade |
| Average Win | Mean winning trade value |
| Average Loss | Mean losing trade value |
| Largest Win | Biggest single winner |
| Largest Loss | Biggest single loser |
| R:R Ratio | Average risk/reward ratio |
| Win/Lose Streak | Current and longest streaks |

## ThinkorSwim Import

The CLI supports importing trades from ThinkorSwim CSV exports. To export from ToS:

1. Open thinkorswim
2. Go to **Monitor** → **Account Statement**
3. Select the date range
4. Click **Export to File** (CSV format)

The importer will:
- Parse execution times, symbols, quantities, and prices
- Detect if trades are opening or closing positions
- Match entries with exits using FIFO (First In, First Out)
- Calculate P&L for matched trades
- Skip duplicate imports

## Data Storage

All data is stored locally in SQLite at:
- **macOS/Linux**: `~/.local/share/trade-journal/trades.db`
- **Custom**: Set `TRADE_JOURNAL_DATA_DIR` environment variable

## Development

```bash
# Watch mode
pnpm dev

# Run tests
pnpm test

# Type checking
pnpm typecheck

# Build
pnpm build
```

## Inspired By

- [TradeNote](https://github.com/Eleven-Trading/TradeNote) - Web-based trading journal
- [Deltalytix](https://github.com/hugodemenez/deltalytix) - Trading analytics platform

## License

ISC
