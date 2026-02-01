// Database tests

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { tmpdir } from 'os';
import { join } from 'path';
import { unlinkSync, existsSync } from 'fs';
import {
  getDatabase,
  closeDatabase,
  insertTrade,
  getTrade,
  getTrades,
  calculateStats,
  calculatePnL,
} from '../core/database.js';

describe('Database', () => {
  const testDbPath = join(tmpdir(), `trade-journal-test-${Date.now()}.db`);

  afterEach(() => {
    closeDatabase();
    if (existsSync(testDbPath)) {
      try {
        unlinkSync(testDbPath);
        unlinkSync(testDbPath + '-wal');
        unlinkSync(testDbPath + '-shm');
      } catch {}
    }
  });

  describe('insertTrade', () => {
    it('should insert a trade and return it with an id', () => {
      const db = getDatabase(testDbPath);

      const trade = insertTrade(db, {
        symbol: 'TSLA',
        side: 'long',
        assetType: 'stock',
        status: 'closed',
        entryPrice: 280.50,
        entryDate: new Date('2024-01-15'),
        entryQuantity: 100,
        exitPrice: 285.00,
        exitDate: new Date('2024-01-16'),
        exitQuantity: 100,
        pnl: 450,
        pnlPercent: 1.6,
        stopLoss: 275,
        takeProfit: 290,
        riskRewardRatio: 1.72,
        commission: 0,
        fees: 0,
        notes: 'Test trade',
        strategy: 'momentum',
        tags: ['test'],
        importHash: null,
        importSource: 'manual',
      });

      expect(trade.id).toBeDefined();
      expect(trade.symbol).toBe('TSLA');
      expect(trade.pnl).toBe(450);
    });

    it('should retrieve a trade by id', () => {
      const db = getDatabase(testDbPath);

      const inserted = insertTrade(db, {
        symbol: 'AAPL',
        side: 'short',
        assetType: 'stock',
        status: 'open',
        entryPrice: 180,
        entryDate: new Date('2024-01-20'),
        entryQuantity: 50,
        exitPrice: null,
        exitDate: null,
        exitQuantity: null,
        pnl: null,
        pnlPercent: null,
        stopLoss: 185,
        takeProfit: 170,
        riskRewardRatio: 2,
        commission: 0,
        fees: 0,
        notes: null,
        strategy: null,
        tags: [],
        importHash: null,
        importSource: 'manual',
      });

      const retrieved = getTrade(db, inserted.id);
      expect(retrieved).not.toBeNull();
      expect(retrieved!.symbol).toBe('AAPL');
      expect(retrieved!.side).toBe('short');
      expect(retrieved!.status).toBe('open');
    });
  });

  describe('getTrades', () => {
    it('should filter trades by symbol', () => {
      const db = getDatabase(testDbPath);

      // Insert multiple trades
      insertTrade(db, createTestTrade({ symbol: 'TSLA' }));
      insertTrade(db, createTestTrade({ symbol: 'AAPL' }));
      insertTrade(db, createTestTrade({ symbol: 'TSLA' }));

      const tslaTrades = getTrades(db, { symbol: 'TSLA' });
      expect(tslaTrades.length).toBe(2);
      expect(tslaTrades.every(t => t.symbol === 'TSLA')).toBe(true);
    });

    it('should filter trades by status', () => {
      const db = getDatabase(testDbPath);

      insertTrade(db, createTestTrade({ status: 'open' }));
      insertTrade(db, createTestTrade({ status: 'closed' }));
      insertTrade(db, createTestTrade({ status: 'closed' }));

      const openTrades = getTrades(db, { status: 'open' });
      expect(openTrades.length).toBe(1);

      const closedTrades = getTrades(db, { status: 'closed' });
      expect(closedTrades.length).toBe(2);
    });
  });

  describe('calculateStats', () => {
    it('should calculate correct win rate', () => {
      const db = getDatabase(testDbPath);

      // 3 wins, 2 losses = 60% win rate
      insertTrade(db, createTestTrade({ pnl: 100, status: 'closed' }));
      insertTrade(db, createTestTrade({ pnl: 50, status: 'closed' }));
      insertTrade(db, createTestTrade({ pnl: 200, status: 'closed' }));
      insertTrade(db, createTestTrade({ pnl: -75, status: 'closed' }));
      insertTrade(db, createTestTrade({ pnl: -25, status: 'closed' }));

      const stats = calculateStats(db);

      expect(stats.totalTrades).toBe(5);
      expect(stats.winningTrades).toBe(3);
      expect(stats.losingTrades).toBe(2);
      expect(stats.winRate).toBe(60);
    });

    it('should calculate correct P&L totals', () => {
      const db = getDatabase(testDbPath);

      insertTrade(db, createTestTrade({ pnl: 100, status: 'closed' }));
      insertTrade(db, createTestTrade({ pnl: -50, status: 'closed' }));
      insertTrade(db, createTestTrade({ pnl: 75, status: 'closed' }));

      const stats = calculateStats(db);

      expect(stats.grossProfit).toBe(175);
      expect(stats.grossLoss).toBe(50);
      expect(stats.totalPnl).toBe(125);
    });

    it('should calculate profit factor correctly', () => {
      const db = getDatabase(testDbPath);

      insertTrade(db, createTestTrade({ pnl: 200, status: 'closed' }));
      insertTrade(db, createTestTrade({ pnl: -100, status: 'closed' }));

      const stats = calculateStats(db);

      expect(stats.profitFactor).toBe(2); // 200 / 100
    });
  });

  describe('calculatePnL', () => {
    it('should calculate long trade P&L correctly', () => {
      const result = calculatePnL('long', 100, 110, 10);
      expect(result.pnl).toBe(100); // (110 - 100) * 10
      expect(result.pnlPercent).toBeCloseTo(10); // 10%
    });

    it('should calculate short trade P&L correctly', () => {
      const result = calculatePnL('short', 100, 90, 10);
      expect(result.pnl).toBe(100); // (100 - 90) * 10
      expect(result.pnlPercent).toBeCloseTo(10);
    });

    it('should subtract commissions and fees', () => {
      const result = calculatePnL('long', 100, 110, 10, 5, 3);
      expect(result.pnl).toBe(92); // 100 - 5 - 3
    });

    it('should calculate losing long trade correctly', () => {
      const result = calculatePnL('long', 100, 95, 10);
      expect(result.pnl).toBe(-50); // (95 - 100) * 10
      expect(result.pnlPercent).toBeCloseTo(-5);
    });
  });
});

// Helper to create test trades
function createTestTrade(overrides: Partial<Parameters<typeof insertTrade>[1]> = {}) {
  return {
    symbol: 'TEST',
    side: 'long' as const,
    assetType: 'stock' as const,
    status: 'closed' as const,
    entryPrice: 100,
    entryDate: new Date(),
    entryQuantity: 10,
    exitPrice: 105,
    exitDate: new Date(),
    exitQuantity: 10,
    pnl: 50,
    pnlPercent: 5,
    stopLoss: null,
    takeProfit: null,
    riskRewardRatio: null,
    commission: 0,
    fees: 0,
    notes: null,
    strategy: null,
    tags: [],
    importHash: null,
    importSource: 'test',
    ...overrides,
  };
}
