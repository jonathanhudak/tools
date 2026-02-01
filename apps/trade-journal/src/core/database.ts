// Database operations using better-sqlite3

import Database from 'better-sqlite3';
import { nanoid } from 'nanoid';
import type { Trade, Import, TradeStats, DailyStats, SymbolStats } from './types.js';
import { CREATE_TABLES, SCHEMA_VERSION } from './schema.js';

let db: Database.Database | null = null;

export function getDatabase(dbPath: string): Database.Database {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    initializeDatabase(db);
  }
  return db;
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}

function initializeDatabase(database: Database.Database): void {
  database.exec(CREATE_TABLES);

  const versionRow = database.prepare('SELECT version FROM schema_version LIMIT 1').get() as
    | { version: number }
    | undefined;

  if (!versionRow) {
    database.prepare('INSERT INTO schema_version (version) VALUES (?)').run(SCHEMA_VERSION);
  }
}

// Trade operations

export function insertTrade(
  database: Database.Database,
  trade: Omit<Trade, 'id' | 'createdAt' | 'updatedAt'>
): Trade {
  const id = nanoid();
  
  database
    .prepare(
      `INSERT INTO trades (
        id, symbol, side, asset_type, status,
        entry_price, entry_date, entry_quantity,
        exit_price, exit_date, exit_quantity,
        pnl, pnl_percent,
        stop_loss, take_profit, risk_reward_ratio,
        commission, fees,
        notes, strategy, tags,
        import_hash, import_source
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      id,
      trade.symbol,
      trade.side,
      trade.assetType,
      trade.status,
      trade.entryPrice,
      trade.entryDate.toISOString().split('T')[0],
      trade.entryQuantity,
      trade.exitPrice,
      trade.exitDate?.toISOString().split('T')[0] ?? null,
      trade.exitQuantity,
      trade.pnl,
      trade.pnlPercent,
      trade.stopLoss,
      trade.takeProfit,
      trade.riskRewardRatio,
      trade.commission,
      trade.fees,
      trade.notes,
      trade.strategy,
      JSON.stringify(trade.tags),
      trade.importHash,
      trade.importSource
    );

  return getTrade(database, id)!;
}

export function getTrade(database: Database.Database, id: string): Trade | null {
  const row = database.prepare('SELECT * FROM trades WHERE id = ?').get(id) as
    | Record<string, unknown>
    | undefined;
  return row ? mapRowToTrade(row) : null;
}

export function tradeExists(database: Database.Database, importHash: string): boolean {
  const row = database.prepare('SELECT 1 FROM trades WHERE import_hash = ?').get(importHash);
  return !!row;
}

export function getTrades(
  database: Database.Database,
  options: {
    symbol?: string;
    side?: 'long' | 'short';
    status?: 'open' | 'closed';
    from?: Date;
    to?: Date;
    limit?: number;
    offset?: number;
  } = {}
): Trade[] {
  let sql = 'SELECT * FROM trades WHERE 1=1';
  const params: unknown[] = [];

  if (options.symbol) {
    sql += ' AND symbol = ?';
    params.push(options.symbol.toUpperCase());
  }
  if (options.side) {
    sql += ' AND side = ?';
    params.push(options.side);
  }
  if (options.status) {
    sql += ' AND status = ?';
    params.push(options.status);
  }
  if (options.from) {
    sql += ' AND entry_date >= ?';
    params.push(options.from.toISOString().split('T')[0]);
  }
  if (options.to) {
    sql += ' AND entry_date <= ?';
    params.push(options.to.toISOString().split('T')[0]);
  }

  sql += ' ORDER BY entry_date DESC';

  if (options.limit) {
    sql += ' LIMIT ?';
    params.push(options.limit);
  }
  if (options.offset) {
    sql += ' OFFSET ?';
    params.push(options.offset);
  }

  const rows = database.prepare(sql).all(...params) as Record<string, unknown>[];
  return rows.map(mapRowToTrade);
}

export function getClosedTrades(
  database: Database.Database,
  from?: Date,
  to?: Date
): Trade[] {
  return getTrades(database, { status: 'closed', from, to });
}

export function updateTrade(
  database: Database.Database,
  id: string,
  updates: Partial<Omit<Trade, 'id' | 'createdAt'>>
): void {
  const setClauses: string[] = [];
  const params: unknown[] = [];

  if (updates.exitPrice !== undefined) {
    setClauses.push('exit_price = ?');
    params.push(updates.exitPrice);
  }
  if (updates.exitDate !== undefined) {
    setClauses.push('exit_date = ?');
    params.push(updates.exitDate?.toISOString().split('T')[0] ?? null);
  }
  if (updates.exitQuantity !== undefined) {
    setClauses.push('exit_quantity = ?');
    params.push(updates.exitQuantity);
  }
  if (updates.status !== undefined) {
    setClauses.push('status = ?');
    params.push(updates.status);
  }
  if (updates.pnl !== undefined) {
    setClauses.push('pnl = ?');
    params.push(updates.pnl);
  }
  if (updates.pnlPercent !== undefined) {
    setClauses.push('pnl_percent = ?');
    params.push(updates.pnlPercent);
  }
  if (updates.notes !== undefined) {
    setClauses.push('notes = ?');
    params.push(updates.notes);
  }
  if (updates.strategy !== undefined) {
    setClauses.push('strategy = ?');
    params.push(updates.strategy);
  }
  if (updates.stopLoss !== undefined) {
    setClauses.push('stop_loss = ?');
    params.push(updates.stopLoss);
  }
  if (updates.takeProfit !== undefined) {
    setClauses.push('take_profit = ?');
    params.push(updates.takeProfit);
  }

  if (setClauses.length === 0) return;

  setClauses.push('updated_at = CURRENT_TIMESTAMP');
  params.push(id);

  database
    .prepare(`UPDATE trades SET ${setClauses.join(', ')} WHERE id = ?`)
    .run(...params);
}

function mapRowToTrade(row: Record<string, unknown>): Trade {
  return {
    id: row.id as string,
    symbol: row.symbol as string,
    side: row.side as Trade['side'],
    assetType: row.asset_type as Trade['assetType'],
    status: row.status as Trade['status'],
    entryPrice: row.entry_price as number,
    entryDate: new Date(row.entry_date as string),
    entryQuantity: row.entry_quantity as number,
    exitPrice: row.exit_price as number | null,
    exitDate: row.exit_date ? new Date(row.exit_date as string) : null,
    exitQuantity: row.exit_quantity as number | null,
    pnl: row.pnl as number | null,
    pnlPercent: row.pnl_percent as number | null,
    stopLoss: row.stop_loss as number | null,
    takeProfit: row.take_profit as number | null,
    riskRewardRatio: row.risk_reward_ratio as number | null,
    commission: row.commission as number,
    fees: row.fees as number,
    notes: row.notes as string | null,
    strategy: row.strategy as string | null,
    tags: row.tags ? JSON.parse(row.tags as string) : [],
    importHash: row.import_hash as string | null,
    importSource: row.import_source as string | null,
    createdAt: new Date(row.created_at as string),
    updatedAt: row.updated_at ? new Date(row.updated_at as string) : null,
  };
}

// Statistics

export function calculateStats(
  database: Database.Database,
  from?: Date,
  to?: Date
): TradeStats {
  const trades = getClosedTrades(database, from, to);
  
  if (trades.length === 0) {
    return {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      breakEvenTrades: 0,
      winRate: 0,
      totalPnl: 0,
      grossProfit: 0,
      grossLoss: 0,
      averageWin: 0,
      averageLoss: 0,
      averagePnl: 0,
      largestWin: 0,
      largestLoss: 0,
      profitFactor: 0,
      expectancy: 0,
      averageRiskReward: null,
      currentStreak: 0,
      longestWinStreak: 0,
      longestLoseStreak: 0,
      periodStart: from ?? new Date(),
      periodEnd: to ?? new Date(),
    };
  }

  const wins = trades.filter(t => (t.pnl ?? 0) > 0);
  const losses = trades.filter(t => (t.pnl ?? 0) < 0);
  const breakEven = trades.filter(t => (t.pnl ?? 0) === 0);

  const grossProfit = wins.reduce((sum, t) => sum + (t.pnl ?? 0), 0);
  const grossLoss = Math.abs(losses.reduce((sum, t) => sum + (t.pnl ?? 0), 0));
  const totalPnl = grossProfit - grossLoss;

  const averageWin = wins.length > 0 ? grossProfit / wins.length : 0;
  const averageLoss = losses.length > 0 ? grossLoss / losses.length : 0;

  const pnls = trades.map(t => t.pnl ?? 0);
  const largestWin = Math.max(...pnls, 0);
  const largestLoss = Math.min(...pnls, 0);

  // Calculate streaks
  let currentStreak = 0;
  let longestWinStreak = 0;
  let longestLoseStreak = 0;
  let tempWinStreak = 0;
  let tempLoseStreak = 0;

  // Sort by date for streak calculation
  const sortedTrades = [...trades].sort((a, b) => 
    a.entryDate.getTime() - b.entryDate.getTime()
  );

  for (const trade of sortedTrades) {
    if ((trade.pnl ?? 0) > 0) {
      tempWinStreak++;
      tempLoseStreak = 0;
      if (tempWinStreak > longestWinStreak) longestWinStreak = tempWinStreak;
    } else if ((trade.pnl ?? 0) < 0) {
      tempLoseStreak++;
      tempWinStreak = 0;
      if (tempLoseStreak > longestLoseStreak) longestLoseStreak = tempLoseStreak;
    }
  }

  // Current streak (from most recent trade)
  const lastTrade = sortedTrades[sortedTrades.length - 1];
  if (lastTrade && (lastTrade.pnl ?? 0) > 0) {
    currentStreak = tempWinStreak;
  } else if (lastTrade && (lastTrade.pnl ?? 0) < 0) {
    currentStreak = -tempLoseStreak;
  }

  // Risk/Reward
  const tradesWithRR = trades.filter(t => t.riskRewardRatio !== null);
  const averageRiskReward = tradesWithRR.length > 0
    ? tradesWithRR.reduce((sum, t) => sum + (t.riskRewardRatio ?? 0), 0) / tradesWithRR.length
    : null;

  const dates = trades.map(t => t.entryDate.getTime());

  return {
    totalTrades: trades.length,
    winningTrades: wins.length,
    losingTrades: losses.length,
    breakEvenTrades: breakEven.length,
    winRate: trades.length > 0 ? (wins.length / trades.length) * 100 : 0,
    totalPnl,
    grossProfit,
    grossLoss,
    averageWin,
    averageLoss,
    averagePnl: trades.length > 0 ? totalPnl / trades.length : 0,
    largestWin,
    largestLoss: Math.abs(largestLoss),
    profitFactor: grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0,
    expectancy: trades.length > 0 ? totalPnl / trades.length : 0,
    averageRiskReward,
    currentStreak,
    longestWinStreak,
    longestLoseStreak,
    periodStart: new Date(Math.min(...dates)),
    periodEnd: new Date(Math.max(...dates)),
  };
}

export function getDailyStats(
  database: Database.Database,
  from?: Date,
  to?: Date
): DailyStats[] {
  let sql = `
    SELECT 
      entry_date as date,
      COUNT(*) as trades,
      SUM(pnl) as pnl,
      SUM(CASE WHEN pnl > 0 THEN 1 ELSE 0 END) as wins,
      SUM(CASE WHEN pnl < 0 THEN 1 ELSE 0 END) as losses
    FROM trades
    WHERE status = 'closed'
  `;
  const params: unknown[] = [];

  if (from) {
    sql += ' AND entry_date >= ?';
    params.push(from.toISOString().split('T')[0]);
  }
  if (to) {
    sql += ' AND entry_date <= ?';
    params.push(to.toISOString().split('T')[0]);
  }

  sql += ' GROUP BY entry_date ORDER BY entry_date';

  const rows = database.prepare(sql).all(...params) as Array<{
    date: string;
    trades: number;
    pnl: number;
    wins: number;
    losses: number;
  }>;

  return rows.map(r => ({
    date: new Date(r.date),
    trades: r.trades,
    pnl: r.pnl ?? 0,
    wins: r.wins,
    losses: r.losses,
  }));
}

export function getSymbolStats(
  database: Database.Database,
  from?: Date,
  to?: Date
): SymbolStats[] {
  let sql = `
    SELECT 
      symbol,
      COUNT(*) as trades,
      SUM(CASE WHEN pnl > 0 THEN 1 ELSE 0 END) as wins,
      SUM(CASE WHEN pnl < 0 THEN 1 ELSE 0 END) as losses,
      SUM(pnl) as total_pnl,
      AVG(pnl) as avg_pnl
    FROM trades
    WHERE status = 'closed'
  `;
  const params: unknown[] = [];

  if (from) {
    sql += ' AND entry_date >= ?';
    params.push(from.toISOString().split('T')[0]);
  }
  if (to) {
    sql += ' AND entry_date <= ?';
    params.push(to.toISOString().split('T')[0]);
  }

  sql += ' GROUP BY symbol ORDER BY total_pnl DESC';

  const rows = database.prepare(sql).all(...params) as Array<{
    symbol: string;
    trades: number;
    wins: number;
    losses: number;
    total_pnl: number;
    avg_pnl: number;
  }>;

  return rows.map(r => ({
    symbol: r.symbol,
    trades: r.trades,
    wins: r.wins,
    losses: r.losses,
    winRate: r.trades > 0 ? (r.wins / r.trades) * 100 : 0,
    totalPnl: r.total_pnl ?? 0,
    averagePnl: r.avg_pnl ?? 0,
  }));
}

// Import tracking

export function createImport(
  database: Database.Database,
  imp: Omit<Import, 'id' | 'createdAt'>
): Import {
  const id = nanoid();
  database
    .prepare(
      `INSERT INTO imports (id, filename, source, row_count, imported_count, skipped_count)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(id, imp.filename, imp.source, imp.rowCount, imp.importedCount, imp.skippedCount);

  return getImport(database, id)!;
}

export function getImport(database: Database.Database, id: string): Import | null {
  const row = database.prepare('SELECT * FROM imports WHERE id = ?').get(id) as
    | Record<string, unknown>
    | undefined;
  return row ? mapRowToImport(row) : null;
}

function mapRowToImport(row: Record<string, unknown>): Import {
  return {
    id: row.id as string,
    filename: row.filename as string,
    source: row.source as string,
    rowCount: row.row_count as number,
    importedCount: row.imported_count as number,
    skippedCount: row.skipped_count as number,
    createdAt: new Date(row.created_at as string),
  };
}

// Utility to calculate P&L for a trade
export function calculatePnL(
  side: 'long' | 'short',
  entryPrice: number,
  exitPrice: number,
  quantity: number,
  commission: number = 0,
  fees: number = 0
): { pnl: number; pnlPercent: number } {
  let pnl: number;
  
  if (side === 'long') {
    pnl = (exitPrice - entryPrice) * quantity;
  } else {
    pnl = (entryPrice - exitPrice) * quantity;
  }
  
  pnl -= (commission + fees);
  
  const costBasis = entryPrice * quantity;
  const pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
  
  return { pnl, pnlPercent };
}
