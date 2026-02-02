// Configuration management

import path from 'path';
import os from 'os';
import fs from 'fs';

const APP_NAME = 'trade-journal';

export function getDataDir(): string {
  const dataDir = process.env.TRADE_JOURNAL_DATA_DIR 
    || path.join(os.homedir(), '.local', 'share', APP_NAME);
  return dataDir;
}

export function getDatabasePath(): string {
  return path.join(getDataDir(), 'trades.db');
}

export function ensureDataDir(): void {
  const dataDir = getDataDir();
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

export function getReportsDir(): string {
  const reportsDir = path.join(getDataDir(), 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  return reportsDir;
}
