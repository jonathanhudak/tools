// ThinkorSwim parser tests

import { describe, it, expect } from 'vitest';
import { generateImportHash, groupTradesBySymbol, type ParsedToSTrade } from '../import/tos-parser.js';

describe('ToS Parser', () => {
  describe('generateImportHash', () => {
    it('should generate consistent hashes for same input', () => {
      const date = new Date('2024-01-15T10:30:00');
      const hash1 = generateImportHash(date, 'TSLA', 'long', 280.50, 100);
      const hash2 = generateImportHash(date, 'TSLA', 'long', 280.50, 100);
      
      expect(hash1).toBe(hash2);
    });

    it('should generate different hashes for different inputs', () => {
      const date = new Date('2024-01-15T10:30:00');
      const hash1 = generateImportHash(date, 'TSLA', 'long', 280.50, 100);
      const hash2 = generateImportHash(date, 'AAPL', 'long', 280.50, 100);
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('groupTradesBySymbol', () => {
    it('should group trades by symbol', () => {
      const trades: ParsedToSTrade[] = [
        createParsedTrade({ symbol: 'TSLA', isOpening: true }),
        createParsedTrade({ symbol: 'AAPL', isOpening: true }),
        createParsedTrade({ symbol: 'TSLA', isOpening: false }),
        createParsedTrade({ symbol: 'TSLA', isOpening: true }),
      ];

      const grouped = groupTradesBySymbol(trades);

      expect(grouped.length).toBe(2);
      
      const tslaGroup = grouped.find(g => g.symbol === 'TSLA');
      expect(tslaGroup?.entries.length).toBe(2);
      expect(tslaGroup?.exits.length).toBe(1);

      const aaplGroup = grouped.find(g => g.symbol === 'AAPL');
      expect(aaplGroup?.entries.length).toBe(1);
      expect(aaplGroup?.exits.length).toBe(0);
    });

    it('should separate entries and exits', () => {
      const trades: ParsedToSTrade[] = [
        createParsedTrade({ symbol: 'SPY', isOpening: true }),
        createParsedTrade({ symbol: 'SPY', isOpening: false }),
        createParsedTrade({ symbol: 'SPY', isOpening: false }),
      ];

      const grouped = groupTradesBySymbol(trades);
      const spyGroup = grouped[0];

      expect(spyGroup.entries.length).toBe(1);
      expect(spyGroup.exits.length).toBe(2);
    });
  });
});

// Helper to create test parsed trades
function createParsedTrade(overrides: Partial<ParsedToSTrade> = {}): ParsedToSTrade {
  return {
    execTime: new Date(),
    symbol: 'TEST',
    side: 'long',
    assetType: 'stock',
    quantity: 100,
    price: 100,
    netPrice: 100,
    isOpening: true,
    rawRow: {},
    ...overrides,
  };
}
