// Categorize command - categorize transactions using rules and AI

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { createHash } from 'crypto';
import {
  getDatabase,
  getUncategorizedTransactions,
  getTransactions,
  updateTransactionCategory,
  updateTransactionMerchant,
  getAllCategories,
  getCachedAIResult,
  setCachedAIResult,
} from '../core/database.js';
import { getDatabasePath, ensureDataDir, getConfig } from '../core/config.js';
import { RuleEngine } from '../categorization/rule-engine.js';
import { createAIProvider } from '../categorization/ai/index.js';
import type { AIProvider } from '../categorization/ai/provider.js';
import type { Transaction, Category } from '../core/types.js';

export function createCategorizeCommand(): Command {
  const cmd = new Command('categorize')
    .description('Categorize transactions using rules and AI')
    .option('-a, --all', 'Re-categorize all transactions (not just uncategorized)')
    .option('--force', 'Force re-categorization even if already categorized')
    .option('-i, --interactive', 'Interactive mode - confirm each categorization')
    .option('-p, --provider <name>', 'AI provider: ollama, anthropic, gemini')
    .option('--rules-only', 'Only use rule-based categorization (no AI)')
    .option('--init-rules', 'Initialize default categorization rules')
    .option('--normalize', 'Also normalize merchant names using AI')
    .action(async (options) => {
      await runCategorize(options);
    });

  return cmd;
}

async function runCategorize(options: {
  all?: boolean;
  force?: boolean;
  interactive?: boolean;
  provider?: string;
  rulesOnly?: boolean;
  initRules?: boolean;
  normalize?: boolean;
}): Promise<void> {
  ensureDataDir();
  const db = getDatabase(getDatabasePath());
  const config = getConfig();

  // Initialize rule engine
  const ruleEngine = new RuleEngine(db);

  // Initialize default rules if requested
  if (options.initRules) {
    const count = ruleEngine.initializeDefaultRules();
    console.log(chalk.green(`Initialized ${count} default categorization rules.`));
    if (!options.all) return;
  }

  // Get transactions to categorize
  let transactions: Transaction[];
  if (options.all) {
    transactions = getTransactions(db, { limit: 10000 });
    if (!options.force) {
      // Still filter out already categorized unless --force
      transactions = transactions.filter((t) => !t.categoryId);
    }
  } else {
    transactions = getUncategorizedTransactions(db);
  }

  if (transactions.length === 0) {
    console.log(chalk.green('All transactions are already categorized!'));
    return;
  }

  console.log(chalk.bold(`\nCategorizing ${transactions.length} transactions...\n`));

  // Get categories for display
  const categories = getAllCategories(db);

  // Set up AI provider if not rules-only
  let aiProvider: AIProvider | null = null;
  if (!options.rulesOnly) {
    try {
      const aiConfig = {
        ...config.ai,
        provider: (options.provider ?? config.ai.provider) as 'ollama' | 'anthropic' | 'gemini',
      };
      aiProvider = createAIProvider(aiConfig);

      const spinner = ora('Checking AI provider availability...').start();
      const available = await aiProvider.isAvailable();
      if (available) {
        spinner.succeed(`AI provider ready: ${aiProvider.name}`);
      } else {
        spinner.warn(`AI provider not available, falling back to rules only`);
        aiProvider = null;
      }
    } catch (error) {
      console.log(chalk.yellow(`AI not available: ${error instanceof Error ? error.message : 'Unknown error'}`));
      aiProvider = null;
    }
  }

  // Process transactions
  let categorizedByRules = 0;
  let categorizedByAI = 0;
  let normalized = 0;
  let skipped = 0;

  const progressSpinner = ora('Processing...').start();

  for (let i = 0; i < transactions.length; i++) {
    const tx = transactions[i];
    progressSpinner.text = `Processing ${i + 1}/${transactions.length}: ${tx.description.slice(0, 30)}...`;

    // Try rule-based categorization first
    const ruleResult = ruleEngine.categorize(tx.description);

    if (ruleResult && ruleResult.confidence >= 0.7) {
      if (options.interactive) {
        progressSpinner.stop();
        const confirmed = await confirmCategorization(tx, ruleResult.categoryId, categories, 'rule');
        if (confirmed) {
          updateTransactionCategory(db, tx.id, ruleResult.categoryId, 'rule', ruleResult.confidence);
          categorizedByRules++;
        } else {
          skipped++;
        }
        progressSpinner.start();
      } else {
        updateTransactionCategory(db, tx.id, ruleResult.categoryId, 'rule', ruleResult.confidence);
        categorizedByRules++;
      }
      continue;
    }

    // Try AI categorization
    if (aiProvider) {
      const cacheKey = createHash('md5').update(tx.description.toLowerCase()).digest('hex');
      let cached = getCachedAIResult(db, cacheKey, aiProvider.name, 'categorize');

      let categoryId: string | null = null;
      let confidence: number | null = null;

      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          categoryId = parsed.categoryId;
          confidence = parsed.confidence;
        } catch {
          // Invalid cache
        }
      }

      if (!categoryId) {
        try {
          const aiResult = await aiProvider.categorize(
            { description: tx.description, amount: tx.amount },
            categories
          );

          if (aiResult) {
            categoryId = aiResult.categoryId;
            confidence = aiResult.confidence;

            // Cache the result
            setCachedAIResult(
              db,
              cacheKey,
              aiProvider.name,
              'categorize',
              JSON.stringify(aiResult)
            );
          }
        } catch (error) {
          // AI error, skip
        }
      }

      if (categoryId && confidence && confidence >= 0.5) {
        // Verify category exists
        const category = categories.find((c) => c.id === categoryId);
        if (category) {
          if (options.interactive) {
            progressSpinner.stop();
            const confirmed = await confirmCategorization(tx, categoryId, categories, 'ai');
            if (confirmed) {
              updateTransactionCategory(db, tx.id, categoryId, 'ai', confidence);
              categorizedByAI++;
            } else {
              skipped++;
            }
            progressSpinner.start();
          } else {
            updateTransactionCategory(db, tx.id, categoryId, 'ai', confidence);
            categorizedByAI++;
          }

          // Normalize merchant name if requested
          if (options.normalize && !tx.normalizedMerchant) {
            try {
              const normalizedName = await aiProvider.normalizeMerchant(tx.description);
              if (normalizedName && normalizedName !== tx.description) {
                updateTransactionMerchant(db, tx.id, normalizedName);
                normalized++;
              }
            } catch {
              // Normalization error, skip
            }
          }

          continue;
        }
      }
    }

    // Could not categorize
    skipped++;
  }

  progressSpinner.succeed('Categorization complete!');

  // Summary
  console.log(chalk.bold('\nSummary:'));
  console.log(`  ${chalk.green('✓')} Categorized by rules: ${categorizedByRules}`);
  if (aiProvider) {
    console.log(`  ${chalk.blue('✓')} Categorized by AI: ${categorizedByAI}`);
  }
  if (options.normalize) {
    console.log(`  ${chalk.cyan('✓')} Merchants normalized: ${normalized}`);
  }
  if (skipped > 0) {
    console.log(`  ${chalk.yellow('○')} Uncategorized: ${skipped}`);
  }
  console.log();
}

async function confirmCategorization(
  tx: Transaction,
  categoryId: string,
  categories: Category[],
  source: string
): Promise<boolean> {
  const category = categories.find((c) => c.id === categoryId);
  const categoryName = category?.name ?? categoryId;

  console.log();
  console.log(chalk.bold('Transaction:'));
  console.log(`  Date: ${tx.date.toISOString().split('T')[0]}`);
  console.log(`  Description: ${tx.description}`);
  console.log(`  Amount: ${tx.amount >= 0 ? '+' : ''}$${tx.amount.toFixed(2)}`);
  console.log();
  console.log(`Suggested category (${source}): ${chalk.cyan(categoryName)}`);

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'Accept this categorization?',
      choices: [
        { name: 'Yes, accept', value: 'accept' },
        { name: 'No, skip', value: 'skip' },
        { name: 'Choose different category', value: 'choose' },
      ],
    },
  ]);

  if (action === 'accept') {
    return true;
  } else if (action === 'skip') {
    return false;
  } else {
    // Let user choose
    const parentCategories = categories.filter((c) => !c.parentId);
    const { parentId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'parentId',
        message: 'Select parent category:',
        choices: parentCategories.map((c) => ({ name: c.name, value: c.id })),
      },
    ]);

    const childCategories = categories.filter((c) => c.parentId === parentId);
    if (childCategories.length > 0) {
      const { childId } = await inquirer.prompt([
        {
          type: 'list',
          name: 'childId',
          message: 'Select subcategory:',
          choices: [
            { name: `${parentCategories.find((c) => c.id === parentId)?.name} (general)`, value: parentId },
            ...childCategories.map((c) => ({ name: c.name, value: c.id })),
          ],
        },
      ]);

      // Update with user's choice
      const db = getDatabase(getDatabasePath());
      updateTransactionCategory(db, tx.id, childId, 'manual', 1.0);
    } else {
      const db = getDatabase(getDatabasePath());
      updateTransactionCategory(db, tx.id, parentId, 'manual', 1.0);
    }

    return false; // Already handled
  }
}
