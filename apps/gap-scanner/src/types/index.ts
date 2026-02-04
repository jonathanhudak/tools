/**
 * Types and interfaces for the Gap Scanner CLI
 */

// Finnhub API Types
export interface FinnhubQuote {
  c: number; // Current price
  d: number; // Change
  dp: number; // Percent change
  h: number; // High price of the day
  l: number; // Low price of the day
  o: number; // Open price of the day
  pc: number; // Previous close price
  t: number; // Timestamp
}

export interface FinnhubSymbol {
  description: string;
  displaySymbol: string;
  symbol: string;
  type: string;
  currency?: string;
}

export interface FinnhubProfile {
  country: string;
  currency: string;
  exchange: string;
  ipo: string;
  marketCapitalization: number;
  name: string;
  phone: string;
  shareOutstanding: number;
  ticker: string;
  weburl: string;
  logo: string;
  finnhubIndustry: string;
}

// Scanner Types
export interface ScanFilters {
  minGap: number; // Minimum gap percentage (e.g., 4 for 4%)
  minVolume: number; // Minimum pre-market volume
  maxFloat: number; // Maximum float (shares outstanding)
  priceMin: number; // Minimum price
  priceMax: number; // Maximum price
}

export interface StockGap {
  ticker: string;
  name: string;
  gapPercent: number;
  currentPrice: number;
  previousClose: number;
  volume: number;
  float: number;
  relativeVolume: number;
  timestamp: Date;
}

export interface ScanResult {
  timestamp: Date;
  filters: ScanFilters;
  candidates: StockGap[];
  totalScanned: number;
  totalPassed: number;
}

// API Config
export interface FinnhubConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
}

// CLI Options
export interface ScanOptions {
  minGap?: number;
  minVolume?: number;
  maxFloat?: number;
  priceMin?: number;
  priceMax?: number;
  watch?: boolean;
  interval?: number;
  output?: string;
}

export interface WatchlistOptions {
  add?: string[];
  remove?: string[];
  list?: boolean;
  clear?: boolean;
}

export interface AlertOptions {
  start?: string;
  end?: string;
  enabled?: boolean;
}
