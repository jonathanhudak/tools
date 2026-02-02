// Trade Journal Types

export type TradeSide = 'long' | 'short';
export type TradeStatus = 'open' | 'closed';
export type AssetType = 'stock' | 'option' | 'futures' | 'forex' | 'crypto';

export interface Trade {
  id: string;
  symbol: string;
  side: TradeSide;
  assetType: AssetType;
  status: TradeStatus;
  
  // Entry
  entryPrice: number;
  entryDate: Date;
  entryQuantity: number;
  
  // Exit (null if open)
  exitPrice: number | null;
  exitDate: Date | null;
  exitQuantity: number | null;
  
  // Calculated fields
  pnl: number | null;
  pnlPercent: number | null;
  
  // Risk management
  stopLoss: number | null;
  takeProfit: number | null;
  riskRewardRatio: number | null;
  
  // Fees
  commission: number;
  fees: number;
  
  // Metadata
  notes: string | null;
  strategy: string | null;
  tags: string[];
  
  // Import tracking
  importHash: string | null;
  importSource: string | null;
  
  createdAt: Date;
  updatedAt: Date | null;
}

export interface TradeStats {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  breakEvenTrades: number;
  
  winRate: number;
  
  totalPnl: number;
  grossProfit: number;
  grossLoss: number;
  
  averageWin: number;
  averageLoss: number;
  averagePnl: number;
  
  largestWin: number;
  largestLoss: number;
  
  profitFactor: number;
  expectancy: number;
  
  averageRiskReward: number | null;
  
  // Streaks
  currentStreak: number;
  longestWinStreak: number;
  longestLoseStreak: number;
  
  // Time-based
  periodStart: Date;
  periodEnd: Date;
}

export interface DailyStats {
  date: Date;
  trades: number;
  pnl: number;
  wins: number;
  losses: number;
}

export interface SymbolStats {
  symbol: string;
  trades: number;
  wins: number;
  losses: number;
  winRate: number;
  totalPnl: number;
  averagePnl: number;
}

export interface Import {
  id: string;
  filename: string;
  source: string;
  rowCount: number;
  importedCount: number;
  skippedCount: number;
  createdAt: Date;
}

// ThinkorSwim CSV structure
export interface ToSTradeRow {
  execTime: Date;
  spread: string;
  side: string;
  qty: number;
  posEffect: string;
  symbol: string;
  expDate: string | null;
  strike: string | null;
  type: string | null;
  price: number;
  netPrice: number;
  orderType: string;
}
