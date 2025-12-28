// Config command - manage configuration

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import fs from 'fs';
import {
  getConfig,
  saveConfig,
  setAIProvider,
  getDataDir,
  getDatabasePath,
  getConfigPath,
  ensureDataDir,
} from '../core/config.js';
import { getDatabase, getAllAccounts } from '../core/database.js';
import type { Config, AIConfig } from '../core/types.js';

export function createConfigCommand(): Command {
  const cmd = new Command('config')
    .description('Manage configuration');

  cmd
    .command('show')
    .description('Show current configuration')
    .action(() => {
      showConfig();
    });

  cmd
    .command('set <key> <value>')
    .description('Set a configuration value')
    .action((key: string, value: string) => {
      setConfigValue(key, value);
    });

  cmd
    .command('accounts')
    .description('List all accounts')
    .action(() => {
      listAccounts();
    });

  cmd
    .command('init')
    .description('Interactive configuration setup')
    .action(async () => {
      await interactiveSetup();
    });

  cmd
    .command('path')
    .description('Show data directory path')
    .action(() => {
      console.log(getDataDir());
    });

  return cmd;
}

function showConfig(): void {
  const config = getConfig();

  console.log(chalk.bold('\nCurrent Configuration:\n'));

  console.log(`  ${chalk.cyan('Data Directory:')} ${config.dataDir}`);
  console.log(`  ${chalk.cyan('Database:')} ${getDatabasePath()}`);
  console.log(`  ${chalk.cyan('Config File:')} ${getConfigPath()}`);
  console.log();

  console.log(chalk.bold('AI Settings:'));
  console.log(`  ${chalk.cyan('Provider:')} ${config.ai.provider}`);

  if (config.ai.ollama) {
    console.log(`  ${chalk.cyan('Ollama Host:')} ${config.ai.ollama.host}`);
    console.log(`  ${chalk.cyan('Ollama Model:')} ${config.ai.ollama.model}`);
  }

  if (config.ai.anthropic) {
    const keyDisplay = config.ai.anthropic.apiKey
      ? `${config.ai.anthropic.apiKey.slice(0, 8)}...`
      : 'not set';
    console.log(`  ${chalk.cyan('Anthropic API Key:')} ${keyDisplay}`);
    console.log(`  ${chalk.cyan('Anthropic Model:')} ${config.ai.anthropic.model}`);
  }

  if (config.ai.gemini) {
    const keyDisplay = config.ai.gemini.apiKey
      ? `${config.ai.gemini.apiKey.slice(0, 8)}...`
      : 'not set';
    console.log(`  ${chalk.cyan('Gemini API Key:')} ${keyDisplay}`);
    console.log(`  ${chalk.cyan('Gemini Model:')} ${config.ai.gemini.model}`);
  }

  if (config.defaultAccount) {
    console.log();
    console.log(`  ${chalk.cyan('Default Account:')} ${config.defaultAccount}`);
  }

  console.log();
}

function setConfigValue(key: string, value: string): void {
  const config = getConfig();

  // Handle nested keys
  const parts = key.split('.');

  if (parts[0] === 'ai') {
    if (parts[1] === 'provider') {
      if (!['ollama', 'anthropic', 'gemini'].includes(value)) {
        console.error(chalk.red('Invalid provider. Use: ollama, anthropic, or gemini'));
        process.exit(1);
      }
      setAIProvider(value as AIConfig['provider']);
      console.log(chalk.green(`Set AI provider to: ${value}`));
      return;
    }

    if (parts.length === 3) {
      const provider = parts[1] as 'ollama' | 'anthropic' | 'gemini';
      const setting = parts[2];

      if (!config.ai[provider]) {
        (config.ai as Record<string, unknown>)[provider] = {};
      }

      (config.ai[provider] as Record<string, string>)[setting] = value;
      saveConfig(config);
      console.log(chalk.green(`Set ${key} to: ${value}`));
      return;
    }
  }

  if (key === 'dataDir') {
    config.dataDir = value;
    saveConfig(config);
    console.log(chalk.green(`Set data directory to: ${value}`));
    return;
  }

  if (key === 'defaultAccount') {
    config.defaultAccount = value;
    saveConfig(config);
    console.log(chalk.green(`Set default account to: ${value}`));
    return;
  }

  console.error(chalk.red(`Unknown configuration key: ${key}`));
  console.log('\nAvailable keys:');
  console.log('  dataDir');
  console.log('  defaultAccount');
  console.log('  ai.provider');
  console.log('  ai.ollama.host');
  console.log('  ai.ollama.model');
  console.log('  ai.anthropic.apiKey');
  console.log('  ai.anthropic.model');
  console.log('  ai.gemini.apiKey');
  console.log('  ai.gemini.model');
}

function listAccounts(): void {
  ensureDataDir();

  const dbPath = getDatabasePath();
  if (!fs.existsSync(dbPath)) {
    console.log(chalk.yellow('No database found. Import some transactions first.'));
    return;
  }

  const db = getDatabase(dbPath);
  const accounts = getAllAccounts(db);

  if (accounts.length === 0) {
    console.log(chalk.yellow('No accounts found. Import some transactions first.'));
    return;
  }

  console.log(chalk.bold('\nAccounts:\n'));

  for (const account of accounts) {
    console.log(`  ${chalk.cyan(account.name)}`);
    console.log(`    Institution: ${account.institution}`);
    console.log(`    Type: ${account.type}`);
    console.log(`    Created: ${account.createdAt.toISOString().split('T')[0]}`);
    console.log();
  }
}

async function interactiveSetup(): Promise<void> {
  console.log(chalk.bold('\nLocal Finance Analyzer Setup\n'));

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'aiProvider',
      message: 'Select your AI provider:',
      choices: [
        { name: 'Ollama (local, free)', value: 'ollama' },
        { name: 'Anthropic (Claude API)', value: 'anthropic' },
        { name: 'Google Gemini', value: 'gemini' },
      ],
      default: 'ollama',
    },
  ]);

  const config = getConfig();
  config.ai.provider = answers.aiProvider;

  if (answers.aiProvider === 'ollama') {
    const ollamaAnswers = await inquirer.prompt([
      {
        type: 'input',
        name: 'host',
        message: 'Ollama host:',
        default: 'http://localhost:11434',
      },
      {
        type: 'input',
        name: 'model',
        message: 'Ollama model:',
        default: 'llama3.2:3b',
      },
    ]);

    config.ai.ollama = {
      host: ollamaAnswers.host,
      model: ollamaAnswers.model,
    };
  } else if (answers.aiProvider === 'anthropic') {
    const anthropicAnswers = await inquirer.prompt([
      {
        type: 'input',
        name: 'apiKey',
        message: 'Anthropic API key (or ${ENV_VAR} format):',
        default: '${ANTHROPIC_API_KEY}',
      },
      {
        type: 'input',
        name: 'model',
        message: 'Anthropic model:',
        default: 'claude-3-haiku-20240307',
      },
    ]);

    config.ai.anthropic = {
      apiKey: anthropicAnswers.apiKey,
      model: anthropicAnswers.model,
    };
  } else if (answers.aiProvider === 'gemini') {
    const geminiAnswers = await inquirer.prompt([
      {
        type: 'input',
        name: 'apiKey',
        message: 'Gemini API key (or ${ENV_VAR} format):',
        default: '${GOOGLE_AI_API_KEY}',
      },
      {
        type: 'input',
        name: 'model',
        message: 'Gemini model:',
        default: 'gemini-1.5-flash',
      },
    ]);

    config.ai.gemini = {
      apiKey: geminiAnswers.apiKey,
      model: geminiAnswers.model,
    };
  }

  saveConfig(config);

  console.log(chalk.green('\nConfiguration saved!'));
  console.log(chalk.dim(`Config file: ${getConfigPath()}`));
  console.log();
}
