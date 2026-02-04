/**
 * Finnhub API client for fetching stock data
 * Documentation: https://finnhub.io/docs/api
 */

import type { FinnhubQuote, FinnhubProfile, FinnhubSymbol, FinnhubConfig } from '../types/index.js';

const DEFAULT_BASE_URL = 'https://finnhub.io/api/v1';
const DEFAULT_TIMEOUT = 10000;

export class FinnhubClient {
  private apiKey: string;
  private baseUrl: string;
  private timeout: number;

  constructor(config: FinnhubConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || DEFAULT_BASE_URL;
    this.timeout = config.timeout || DEFAULT_TIMEOUT;
  }

  /**
   * Fetch quote data for a symbol
   */
  async getQuote(symbol: string): Promise<FinnhubQuote | null> {
    try {
      const url = `${this.baseUrl}/quote?symbol=${symbol}&token=${this.apiKey}`;
      const response = await this.fetchWithTimeout(url);

      if (!response.ok) {
        console.error(`Failed to fetch quote for ${symbol}: ${response.statusText}`);
        return null;
      }

      const data = await response.json();
      return data as FinnhubQuote;
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Fetch company profile data
   */
  async getProfile(symbol: string): Promise<FinnhubProfile | null> {
    try {
      const url = `${this.baseUrl}/stock/profile2?symbol=${symbol}&token=${this.apiKey}`;
      const response = await this.fetchWithTimeout(url);

      if (!response.ok) {
        console.error(`Failed to fetch profile for ${symbol}: ${response.statusText}`);
        return null;
      }

      const data = await response.json();
      return data as FinnhubProfile;
    } catch (error) {
      console.error(`Error fetching profile for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Fetch US stock symbols
   */
  async getUSSymbols(): Promise<FinnhubSymbol[]> {
    try {
      const url = `${this.baseUrl}/stock/symbol?exchange=US&token=${this.apiKey}`;
      const response = await this.fetchWithTimeout(url);

      if (!response.ok) {
        console.error(`Failed to fetch US symbols: ${response.statusText}`);
        return [];
      }

      const data = await response.json();
      return data as FinnhubSymbol[];
    } catch (error) {
      console.error('Error fetching US symbols:', error);
      return [];
    }
  }

  /**
   * Fetch with timeout
   */
  private async fetchWithTimeout(url: string): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Check if API key is valid
   */
  async validateApiKey(): Promise<boolean> {
    try {
      // Try to fetch a quote for a known symbol
      const quote = await this.getQuote('AAPL');
      return quote !== null;
    } catch {
      return false;
    }
  }
}

/**
 * Create a Finnhub client with API key from environment or parameter
 */
export function createFinnhubClient(apiKey?: string): FinnhubClient {
  const key = apiKey || process.env.FINNHUB_API_KEY;

  if (!key) {
    throw new Error(
      'Finnhub API key not found. Please provide it via:\n' +
      '  1. FINNHUB_API_KEY environment variable\n' +
      '  2. --api-key flag\n' +
      '\nGet your free API key at: https://finnhub.io/register'
    );
  }

  return new FinnhubClient({ apiKey: key });
}
