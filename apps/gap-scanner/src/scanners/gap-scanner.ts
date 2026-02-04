/**
 * Gap scanner - identifies stocks with significant pre-market gaps
 */

import type { FinnhubClient } from '../api/finnhub.js';
import type { ScanFilters, StockGap, ScanResult } from '../types/index.js';

const DEFAULT_FILTERS: ScanFilters = {
  minGap: 4.0,
  minVolume: 100000,
  maxFloat: 50000000,
  priceMin: 2.0,
  priceMax: 20.0,
};

// Sample watchlist of popular tickers for scanning
// In production, this could be loaded from a file or config
const DEFAULT_WATCHLIST = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX',
  'AMD', 'INTC', 'BA', 'DIS', 'JPM', 'V', 'WMT', 'PG',
  'JNJ', 'UNH', 'HD', 'BAC', 'XOM', 'CVX', 'PFE', 'KO',
  'ABBV', 'PEP', 'TMO', 'COST', 'MRK', 'ABT', 'NKE', 'DHR',
];

export class GapScanner {
  constructor(
    private client: FinnhubClient,
    private filters: ScanFilters = DEFAULT_FILTERS
  ) {}

  /**
   * Scan a list of tickers for gaps
   */
  async scan(tickers: string[]): Promise<ScanResult> {
    const startTime = new Date();
    const candidates: StockGap[] = [];
    let totalScanned = 0;

    console.log(`Scanning ${tickers.length} tickers for gaps...`);

    // Fetch quotes in batches to respect rate limits (60/min = 1/sec)
    for (const ticker of tickers) {
      totalScanned++;

      try {
        const quote = await this.client.getQuote(ticker);
        if (!quote) continue;

        // Check if there's a gap
        const gapPercent = this.calculateGapPercent(quote.c, quote.pc);
        if (Math.abs(gapPercent) < this.filters.minGap) continue;

        // Get company profile for float and volume data
        const profile = await this.client.getProfile(ticker);
        if (!profile) continue;

        const float = profile.shareOutstanding * 1000000; // Convert from millions
        const currentPrice = quote.c;

        // Apply filters
        if (float > this.filters.maxFloat) continue;
        if (currentPrice < this.filters.priceMin) continue;
        if (currentPrice > this.filters.priceMax) continue;

        // Calculate relative volume (this is simplified - in production would need historical avg)
        // For now, we just use a placeholder
        const relativeVolume = 1.0;

        candidates.push({
          ticker,
          name: profile.name,
          gapPercent,
          currentPrice,
          previousClose: quote.pc,
          volume: 0, // Finnhub free tier doesn't provide pre-market volume easily
          float,
          relativeVolume,
          timestamp: new Date(quote.t * 1000),
        });

        // Rate limiting: wait 1 second between requests (60/min limit)
        await this.sleep(1000);
      } catch (error) {
        console.error(`Error scanning ${ticker}:`, error);
      }
    }

    // Sort by gap percentage (descending)
    candidates.sort((a, b) => Math.abs(b.gapPercent) - Math.abs(a.gapPercent));

    return {
      timestamp: startTime,
      filters: this.filters,
      candidates,
      totalScanned,
      totalPassed: candidates.length,
    };
  }

  /**
   * Scan with default watchlist
   */
  async scanDefault(): Promise<ScanResult> {
    return this.scan(DEFAULT_WATCHLIST);
  }

  /**
   * Calculate gap percentage
   */
  private calculateGapPercent(current: number, previousClose: number): number {
    if (previousClose === 0) return 0;
    return ((current - previousClose) / previousClose) * 100;
  }

  /**
   * Sleep helper for rate limiting
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Update scan filters
   */
  setFilters(filters: Partial<ScanFilters>): void {
    this.filters = { ...this.filters, ...filters };
  }

  /**
   * Get current filters
   */
  getFilters(): ScanFilters {
    return { ...this.filters };
  }
}

/**
 * Create a gap scanner with custom filters
 */
export function createGapScanner(
  client: FinnhubClient,
  filters?: Partial<ScanFilters>
): GapScanner {
  const fullFilters = { ...DEFAULT_FILTERS, ...filters };
  return new GapScanner(client, fullFilters);
}
