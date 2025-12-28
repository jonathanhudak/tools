// Report command - generate HTML reports

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import open from 'open';
import { getDatabase, getActiveRecurringPayments } from '../core/database.js';
import { getDatabasePath, ensureDataDir, getConfig } from '../core/config.js';
import { generateYearReport, generateSpendingSummary, generateRuleBasedInsights } from '../insights/engine.js';
import { generateYearSummaryHTML, generateRecurringHTML, saveReport } from '../reports/generator.js';
import { createAIProvider } from '../categorization/ai/index.js';
import { formatFrequency, getFrequencyMultiplier } from '../recurring/detector.js';

export function createReportCommand(): Command {
  const cmd = new Command('report')
    .description('Generate HTML financial reports')
    .option('-y, --year <year>', 'Generate year summary report')
    .option('-m, --month <month>', 'Generate monthly report (format: YYYY-MM)')
    .option('-r, --recurring', 'Generate recurring payments report')
    .option('--all', 'Generate all reports for current year')
    .option('--open', 'Open report in browser after generation')
    .option('--no-ai', 'Skip AI-generated insights')
    .action(async (options) => {
      await runReport(options);
    });

  return cmd;
}

async function runReport(options: {
  year?: string;
  month?: string;
  recurring?: boolean;
  all?: boolean;
  open?: boolean;
  ai?: boolean;
}): Promise<void> {
  ensureDataDir();
  const db = getDatabase(getDatabasePath());
  const config = getConfig();

  const reportsGenerated: string[] = [];

  // Determine what to generate
  const currentYear = new Date().getFullYear();
  const generateYear = options.year || options.all;
  const generateRecurring = options.recurring || options.all;

  if (!generateYear && !generateRecurring && !options.month) {
    // Default to year summary for current year
    options.year = String(currentYear);
  }

  // Generate year report
  if (options.year || options.all) {
    const year = parseInt(options.year ?? String(currentYear), 10);
    const filePath = await generateYearSummaryReport(db, year, options.ai !== false, config);
    reportsGenerated.push(filePath);
  }

  // Generate recurring report
  if (generateRecurring) {
    const filePath = await generateRecurringReport(db);
    reportsGenerated.push(filePath);
  }

  // Summary
  console.log(chalk.bold('\nReports Generated:'));
  for (const path of reportsGenerated) {
    console.log(`  ${chalk.green('✓')} ${path}`);
  }

  // Open first report in browser
  if (options.open && reportsGenerated.length > 0) {
    console.log(chalk.dim('\nOpening in browser...'));
    await open(reportsGenerated[0]);
  }

  console.log();
}

async function generateYearSummaryReport(
  db: ReturnType<typeof getDatabase>,
  year: number,
  useAI: boolean,
  config: ReturnType<typeof getConfig>
): Promise<string> {
  const spinner = ora(`Generating ${year} year summary...`).start();

  // Generate report data
  const report = generateYearReport(db, year);

  // Add rule-based insights
  report.insights = generateRuleBasedInsights(report);

  // Try AI insights if enabled
  if (useAI && report.insights.length < 5) {
    spinner.text = 'Generating AI insights...';
    try {
      const aiProvider = createAIProvider(config.ai);
      const available = await aiProvider.isAvailable();

      if (available) {
        const summary = generateSpendingSummary(db, year);
        const aiInsights = await aiProvider.generateInsights(summary);

        // Add unique AI insights
        for (const insight of aiInsights) {
          if (!report.insights.some((i) => i.toLowerCase().includes(insight.toLowerCase().slice(0, 30)))) {
            report.insights.push(insight);
          }
        }
      }
    } catch (error) {
      // AI insights failed, continue without
    }
  }

  // Generate HTML
  const html = generateYearSummaryHTML(report);
  const filename = `report-${year}.html`;
  const filePath = saveReport(filename, html);

  spinner.succeed(`Generated ${year} year summary`);
  return filePath;
}

async function generateRecurringReport(db: ReturnType<typeof getDatabase>): Promise<string> {
  const spinner = ora('Generating recurring payments report...').start();

  // Get recurring payments
  const payments = getActiveRecurringPayments(db);

  // Convert to summary format
  const paymentSummaries = payments.map((p) => ({
    merchant: p.merchant,
    frequency: formatFrequency(p.frequency),
    amount: p.expectedAmount ?? 0,
    yearlyTotal: (p.expectedAmount ?? 0) * getFrequencyMultiplier(p.frequency),
    isActive: p.isActive,
    status: p.status,
  }));

  // Generate HTML
  const html = generateRecurringHTML(paymentSummaries);
  const filename = 'recurring.html';
  const filePath = saveReport(filename, html);

  spinner.succeed('Generated recurring payments report');
  return filePath;
}
