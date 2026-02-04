# Gap Scanner CLI

Pre-market gap scanner for Gap & Go trading strategy using Finnhub API.

## Features

- 🔍 **Pre-market Gap Scanning** - Automatically scan for stocks with significant gaps
- 🎯 **Customizable Filters** - Filter by gap %, volume, float, and price range
- 📊 **Clear Output** - Formatted table display with color-coded results
- 💾 **JSON Export** - Save scan results for later analysis
- 🔄 **Watch Mode** - Continuous scanning at custom intervals
- 🆓 **Free API** - Uses Finnhub free tier (60 calls/minute)

## Installation

From the root of the monorepo:

```bash
# Install dependencies
pnpm install

# Navigate to gap-scanner
cd apps/gap-scanner

# Build the CLI
pnpm run build

# Run the scanner
pnpm run gap scan --help
```

## Quick Start

### 1. Get Your Finnhub API Key

1. Sign up at [Finnhub.io](https://finnhub.io/register)
2. Copy your free API key
3. Set it as an environment variable:

```bash
export FINNHUB_API_KEY=your_api_key_here
```

### 2. Run Your First Scan

```bash
# Basic scan with default filters
pnpm run gap scan

# Custom filters
pnpm run gap scan --min-gap 5 --price-min 5 --price-max 50

# Watch mode - scan every 60 seconds
pnpm run gap scan --watch --interval 60

# Save results to JSON
pnpm run gap scan --output results.json
```

## Usage

### Scan Command

```bash
gap scan [options]
```

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--min-gap <percent>` | Minimum gap percentage | `4` |
| `--min-volume <number>` | Minimum pre-market volume | `100000` |
| `--max-float <number>` | Maximum float (shares) | `50000000` |
| `--price-min <dollars>` | Minimum stock price | `2` |
| `--price-max <dollars>` | Maximum stock price | `20` |
| `-w, --watch` | Enable continuous scanning | `false` |
| `-i, --interval <seconds>` | Scan interval (watch mode) | `60` |
| `-o, --output <filepath>` | Save results to JSON | - |
| `--api-key <key>` | Finnhub API key | `FINNHUB_API_KEY` env var |

**Examples:**

```bash
# Scan for gaps > 5% on stocks under $10
gap scan --min-gap 5 --price-max 10

# Scan with high volume filter
gap scan --min-volume 500000

# Scan only small float stocks
gap scan --max-float 20000000

# Watch mode - scan every 2 minutes
gap scan --watch --interval 120

# Save results with timestamp
gap scan --output ./results/morning-scan.json
```

### Output Format

```
Gap Scanner Results
Scanned: 32 | Found: 3 | Time: 6:45:23 AM

TICKER      GAP%     PRICE      VOL    FLOAT     RVOL
─────────────────────────────────────────────────────
ABCD      +8.2%     $4.50     1.2M      12M     3.5x
EFGH      +6.1%    $12.30     890K      28M     2.8x
IJKL      -5.3%     $7.85     654K      19M     2.1x
```

### Watchlist Command (Phase 2)

```bash
# Add tickers to custom watchlist
gap watchlist --add TSLA NVDA AAPL

# Remove tickers
gap watchlist --remove AAPL

# List all tickers
gap watchlist --list

# Clear watchlist
gap watchlist --clear
```

### Alert Command (Phase 2)

```bash
# Set up pre-market alerts (6:00 AM - 9:30 AM)
gap alert --start 6:00 --end 9:30 --enabled
```

### Config Command

```bash
# Show current configuration
gap config
```

## API Rate Limits

Finnhub free tier:
- **60 calls per minute**
- **15-minute delayed data**

The scanner automatically throttles requests to stay within rate limits (1 request per second).

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `FINNHUB_API_KEY` | Your Finnhub API key | Yes |

You can set this in your shell profile:

```bash
# ~/.bashrc or ~/.zshrc
export FINNHUB_API_KEY=your_key_here
```

Or use a `.env` file:

```bash
# .env
FINNHUB_API_KEY=your_key_here
```

## Gap & Go Trading Strategy

This scanner is designed for the **Gap & Go** momentum trading strategy:

### What is a Gap?

A gap occurs when a stock opens significantly higher or lower than its previous close, often due to:
- Earnings announcements
- News catalysts
- Market sentiment shifts
- After-hours trading

### Key Filters

1. **Gap Size** (`--min-gap`): Minimum 4-5% gap to ensure momentum
2. **Float** (`--max-float`): Small float stocks move faster (< 50M shares)
3. **Price Range** (`--price-min/max`): $2-$20 sweet spot for retail traders
4. **Volume** (`--min-volume`): High pre-market volume confirms interest

### Example Morning Routine

```bash
# 6:00 AM - First scan
gap scan --min-gap 4 --output morning-gaps.json

# 7:00-9:30 AM - Watch mode
gap scan --watch --interval 300  # Every 5 minutes

# Review saved results
cat morning-gaps.json | jq '.candidates[] | {ticker, gapPercent, price}'
```

## Development

### Project Structure

```
apps/gap-scanner/
├── src/
│   ├── api/
│   │   └── finnhub.ts          # Finnhub API client
│   ├── scanners/
│   │   └── gap-scanner.ts      # Gap scanning logic
│   ├── formatters/
│   │   ├── table.ts            # Console table formatter
│   │   └── json.ts             # JSON export/import
│   ├── types/
│   │   └── index.ts            # TypeScript types
│   └── cli.ts                  # CLI entry point
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── README.md
```

### Build Commands

```bash
# Development mode (watch for changes)
pnpm run dev

# Production build
pnpm run build

# Type checking
pnpm run typecheck

# Linting
pnpm run lint

# Clean build artifacts
pnpm run clean
```

### Adding New Features

1. **Custom Scanners**: Add new scanner strategies in `src/scanners/`
2. **API Clients**: Add alternative APIs in `src/api/`
3. **Formatters**: Add new output formats in `src/formatters/`
4. **Commands**: Extend CLI in `src/cli.ts`

## Roadmap

### Phase 1 ✅ (Current)
- [x] Core gap scanner with Finnhub API
- [x] Customizable filters
- [x] Table output formatter
- [x] JSON export
- [x] Watch mode
- [x] CLI with Commander.js

### Phase 2 (Next)
- [ ] Watchlist management
- [ ] Alert system (email/SMS/Discord)
- [ ] Alpha Vantage fallback API
- [ ] Historical gap analysis
- [ ] Advanced filters (sector, market cap)

### Phase 3 (Future)
- [ ] Alpaca integration for real-time data
- [ ] Paper trading integration
- [ ] Backtesting engine
- [ ] Web dashboard
- [ ] Mobile notifications

## Troubleshooting

### "Invalid API key" error

1. Check your API key is correct
2. Verify it's set in environment: `echo $FINNHUB_API_KEY`
3. Try setting it via command line: `gap scan --api-key your_key_here`

### Rate limit errors

- Free tier is limited to 60 calls/minute
- Scanner automatically throttles to 1 request/second
- Consider upgrading to paid tier for real-time data

### No gaps found

- Try lowering `--min-gap` threshold
- Expand price range with `--price-max`
- Increase `--max-float` to include more stocks
- Gaps are less common during certain market conditions

## Contributing

This tool is part of the [Tools Monorepo](https://github.com/jonathanhudak/tools). Contributions welcome!

## License

ISC License - See root LICENSE file for details.

## Disclaimer

This tool is for educational and informational purposes only. Not financial advice. Trade at your own risk.

## Links

- [Finnhub API Documentation](https://finnhub.io/docs/api)
- [Gap & Go Strategy Guide](https://www.investopedia.com/terms/g/gap.asp)
- [Tools Monorepo](https://github.com/jonathanhudak/tools)
