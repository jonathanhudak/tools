// Configuration management

import fs from 'fs';
import path from 'path';
import os from 'os';
import type { Config, AIConfig } from './types.js';

const DEFAULT_DATA_DIR = path.join(os.homedir(), '.local-finance');
const CONFIG_FILE = 'config.json';
const DATABASE_FILE = 'data.db';

let cachedConfig: Config | null = null;

export function getDefaultConfig(): Config {
  return {
    dataDir: DEFAULT_DATA_DIR,
    ai: {
      provider: 'ollama',
      ollama: {
        host: 'http://localhost:11434',
        model: 'llama3.2:3b',
      },
    },
  };
}

export function getDataDir(): string {
  const config = getConfig();
  return config.dataDir;
}

export function getDatabasePath(): string {
  return path.join(getDataDir(), DATABASE_FILE);
}

export function getConfigPath(): string {
  return path.join(getDataDir(), CONFIG_FILE);
}

export function getReportsDir(): string {
  const reportsDir = path.join(getDataDir(), 'reports');
  ensureDir(reportsDir);
  return reportsDir;
}

export function ensureDataDir(): void {
  ensureDir(getDataDir());
}

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function getConfig(): Config {
  if (cachedConfig) {
    return cachedConfig;
  }

  const configPath = path.join(DEFAULT_DATA_DIR, CONFIG_FILE);

  if (fs.existsSync(configPath)) {
    try {
      const content = fs.readFileSync(configPath, 'utf-8');
      const parsed = JSON.parse(content) as Partial<Config>;
      cachedConfig = mergeWithDefaults(parsed);
    } catch {
      cachedConfig = getDefaultConfig();
    }
  } else {
    cachedConfig = getDefaultConfig();
  }

  // Resolve environment variables in API keys
  cachedConfig = resolveEnvVars(cachedConfig);

  return cachedConfig;
}

export function saveConfig(config: Config): void {
  ensureDataDir();
  const configPath = getConfigPath();
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  cachedConfig = config;
}

export function updateConfig(updates: Partial<Config>): Config {
  const current = getConfig();
  const updated = { ...current, ...updates };
  saveConfig(updated);
  return updated;
}

export function setAIProvider(
  provider: AIConfig['provider'],
  settings?: Partial<AIConfig['ollama'] | AIConfig['anthropic'] | AIConfig['gemini']>
): Config {
  const current = getConfig();
  const updated: Config = {
    ...current,
    ai: {
      ...current.ai,
      provider,
    },
  };

  if (settings) {
    if (provider === 'ollama') {
      updated.ai.ollama = { ...updated.ai.ollama, ...settings } as AIConfig['ollama'];
    } else if (provider === 'anthropic') {
      updated.ai.anthropic = { ...updated.ai.anthropic, ...settings } as AIConfig['anthropic'];
    } else if (provider === 'gemini') {
      updated.ai.gemini = { ...updated.ai.gemini, ...settings } as AIConfig['gemini'];
    }
  }

  saveConfig(updated);
  return updated;
}

function mergeWithDefaults(partial: Partial<Config>): Config {
  const defaults = getDefaultConfig();
  return {
    dataDir: partial.dataDir ?? defaults.dataDir,
    ai: {
      provider: partial.ai?.provider ?? defaults.ai.provider,
      ollama: partial.ai?.ollama ?? defaults.ai.ollama,
      anthropic: partial.ai?.anthropic,
      gemini: partial.ai?.gemini,
    },
    defaultAccount: partial.defaultAccount,
  };
}

function resolveEnvVars(config: Config): Config {
  const resolved = { ...config };

  if (resolved.ai.anthropic?.apiKey) {
    resolved.ai.anthropic = {
      ...resolved.ai.anthropic,
      apiKey: resolveEnvVar(resolved.ai.anthropic.apiKey),
    };
  }

  if (resolved.ai.gemini?.apiKey) {
    resolved.ai.gemini = {
      ...resolved.ai.gemini,
      apiKey: resolveEnvVar(resolved.ai.gemini.apiKey),
    };
  }

  return resolved;
}

function resolveEnvVar(value: string): string {
  // Handle ${ENV_VAR} pattern
  const envMatch = value.match(/^\$\{([^}]+)\}$/);
  if (envMatch) {
    const envName = envMatch[1];
    return process.env[envName] ?? value;
  }

  // Handle $ENV_VAR pattern
  if (value.startsWith('$') && !value.startsWith('${')) {
    const envName = value.slice(1);
    return process.env[envName] ?? value;
  }

  return value;
}

export function resetConfig(): void {
  cachedConfig = null;
}
