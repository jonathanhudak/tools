// Insights engine for generating spending analysis

import type Database from 'better-sqlite3';
import type { Transaction, Category, SpendingSummary, YearReport, CategorySummary, MonthSummary, MerchantSummary, RecurringPaymentSummary } from '../core/types.js';
import { getTransactionsByYear, getAllCategories, getCategorySummary, getMerchantSummary, getActiveRecurringPayments } from '../core/database.js';
import { format } from 'date-fns';
import { getFrequencyMultiplier, formatFrequency } from '../recurring/detector.js';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function generateYearReport(db: Database.Database, year: number): YearReport {
  const transactions = getTransactionsByYear(db, year);
  const categories = getAllCategories(db);
  const categoryMap = new Map(categories.map(c => [c.id, c]));

  // Calculate totals
  let totalIncome = 0;
  let totalExpenses = 0;

  for (const tx of transactions) {
    if (tx.amount > 0) {
      totalIncome += tx.amount;
    } else {
      totalExpenses += tx.amount;
    }
  }

  // Get category summary
  const categorySummaryData = getCategorySummary(db, year);
  const byCategory: CategorySummary[] = categorySummaryData
    .filter(cs => cs.total < 0) // Only expenses
    .map(cs => {
      const category = categoryMap.get(cs.categoryId);
      const parent = category?.parentId ? categoryMap.get(category.parentId) : null;
      return {
        categoryId: cs.categoryId,
        categoryName: category?.name ?? cs.categoryId,
        parentName: parent?.name ?? null,
        amount: Math.abs(cs.total),
        percentage: Math.abs(cs.total / totalExpenses) * 100,
        transactionCount: cs.count,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  // Calculate monthly summary
  const byMonth: MonthSummary[] = [];
  for (let month = 1; month <= 12; month++) {
    const monthTransactions = transactions.filter(tx => {
      const txMonth = tx.date.getMonth() + 1;
      return txMonth === month;
    });

    let monthIncome = 0;
    let monthExpenses = 0;
    for (const tx of monthTransactions) {
      if (tx.amount > 0) {
        monthIncome += tx.amount;
      } else {
        monthExpenses += tx.amount;
      }
    }

    byMonth.push({
      month,
      monthName: MONTH_NAMES[month - 1],
      income: monthIncome,
      expenses: monthExpenses,
      net: monthIncome + monthExpenses,
    });
  }

  // Get top merchants
  const merchantData = getMerchantSummary(db, year, 20);
  const topMerchants: MerchantSummary[] = merchantData.map(m => ({
    merchant: m.merchant,
    amount: Math.abs(m.total),
    count: m.count,
    categoryName: null, // Would need to look up
  }));

  // Get recurring payments
  const recurringPayments = getActiveRecurringPayments(db);
  const recurringPaymentsSummary: RecurringPaymentSummary[] = recurringPayments.map(rp => ({
    merchant: rp.merchant,
    frequency: formatFrequency(rp.frequency),
    amount: rp.expectedAmount ?? 0,
    totalSpent: (rp.expectedAmount ?? 0) * getFrequencyMultiplier(rp.frequency),
    occurrences: getFrequencyMultiplier(rp.frequency),
    isActive: rp.isActive,
    confidence: 1.0,
  }));

  return {
    year,
    totalIncome,
    totalExpenses: Math.abs(totalExpenses),
    net: totalIncome + totalExpenses,
    byCategory,
    byMonth,
    topMerchants,
    recurringPayments: recurringPaymentsSummary,
    insights: [], // Will be filled by AI
  };
}

export function generateSpendingSummary(db: Database.Database, year: number, month?: number): SpendingSummary {
  const transactions = month
    ? getTransactionsByMonth(db, year, month)
    : getTransactionsByYear(db, year);

  const categories = getAllCategories(db);
  const categoryMap = new Map(categories.map(c => [c.id, c]));

  let totalIncome = 0;
  let totalExpenses = 0;
  const categoryTotals: Map<string, number> = new Map();
  const merchantTotals: Map<string, { amount: number; count: number }> = new Map();

  for (const tx of transactions) {
    if (tx.amount > 0) {
      totalIncome += tx.amount;
    } else {
      totalExpenses += tx.amount;
    }

    // Category totals
    if (tx.categoryId) {
      const current = categoryTotals.get(tx.categoryId) ?? 0;
      categoryTotals.set(tx.categoryId, current + tx.amount);
    }

    // Merchant totals
    const merchant = tx.normalizedMerchant ?? tx.description.slice(0, 30);
    const merchantData = merchantTotals.get(merchant) ?? { amount: 0, count: 0 };
    merchantData.amount += tx.amount;
    merchantData.count++;
    merchantTotals.set(merchant, merchantData);
  }

  const period = month
    ? `${MONTH_NAMES[month - 1]} ${year}`
    : `${year}`;

  return {
    period,
    totalIncome,
    totalExpenses,
    byCategory: Array.from(categoryTotals.entries())
      .filter(([_, amount]) => amount < 0)
      .map(([categoryId, amount]) => ({
        categoryId,
        categoryName: categoryMap.get(categoryId)?.name ?? categoryId,
        amount: Math.abs(amount),
      }))
      .sort((a, b) => b.amount - a.amount),
    topMerchants: Array.from(merchantTotals.entries())
      .filter(([_, data]) => data.amount < 0)
      .map(([merchant, data]) => ({
        merchant,
        amount: Math.abs(data.amount),
        count: data.count,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 20),
  };
}

function getTransactionsByMonth(db: Database.Database, year: number, month: number): Transaction[] {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

  const rows = db
    .prepare('SELECT * FROM transactions WHERE date >= ? AND date <= ? ORDER BY date')
    .all(startDate, endDate) as Record<string, unknown>[];

  return rows.map(row => ({
    id: row.id as string,
    accountId: row.account_id as string,
    date: new Date(row.date as string),
    description: row.description as string,
    normalizedMerchant: row.normalized_merchant as string | null,
    amount: row.amount as number,
    categoryId: row.category_id as string | null,
    categorySource: row.category_source as Transaction['categorySource'],
    categoryConfidence: row.category_confidence as number | null,
    isRecurring: !!(row.is_recurring as number),
    recurringId: row.recurring_id as string | null,
    notes: row.notes as string | null,
    rawCsvRow: row.raw_csv_row as string | null,
    importHash: row.import_hash as string,
    createdAt: new Date(row.created_at as string),
    updatedAt: row.updated_at ? new Date(row.updated_at as string) : null,
  }));
}

export function generateRuleBasedInsights(report: YearReport): string[] {
  const insights: string[] = [];

  // Insight: Top spending category
  if (report.byCategory.length > 0) {
    const top = report.byCategory[0];
    insights.push(
      `Your largest expense category was ${top.categoryName}, accounting for ${top.percentage.toFixed(1)}% of spending ($${top.amount.toFixed(2)}).`
    );
  }

  // Insight: Savings rate
  if (report.totalIncome > 0) {
    const savingsRate = ((report.net / report.totalIncome) * 100);
    if (savingsRate > 20) {
      insights.push(
        `Great job! You saved ${savingsRate.toFixed(1)}% of your income this year.`
      );
    } else if (savingsRate > 0) {
      insights.push(
        `You saved ${savingsRate.toFixed(1)}% of your income. Consider aiming for 20% or more.`
      );
    } else {
      insights.push(
        `You spent more than you earned this year. Consider reviewing your budget.`
      );
    }
  }

  // Insight: Monthly variation
  const monthlyExpenses = report.byMonth.map(m => Math.abs(m.expenses));
  const avgMonthlyExpense = monthlyExpenses.reduce((a, b) => a + b, 0) / 12;
  const maxMonth = report.byMonth.reduce((max, m) =>
    Math.abs(m.expenses) > Math.abs(max.expenses) ? m : max
  );
  if (Math.abs(maxMonth.expenses) > avgMonthlyExpense * 1.5) {
    insights.push(
      `${maxMonth.monthName} had unusually high spending ($${Math.abs(maxMonth.expenses).toFixed(2)} vs $${avgMonthlyExpense.toFixed(2)} average).`
    );
  }

  // Insight: Subscriptions
  if (report.recurringPayments.length > 0) {
    const activeSubscriptions = report.recurringPayments.filter(r => r.isActive);
    const totalMonthly = activeSubscriptions.reduce((sum, r) => sum + r.totalSpent / 12, 0);
    if (totalMonthly > 100) {
      insights.push(
        `You have ${activeSubscriptions.length} active subscriptions costing ~$${totalMonthly.toFixed(2)}/month ($${(totalMonthly * 12).toFixed(2)}/year).`
      );
    }
  }

  // Insight: Top merchant concentration
  if (report.topMerchants.length > 0) {
    const topMerchantSpend = report.topMerchants[0].amount;
    const topMerchantPercent = (topMerchantSpend / report.totalExpenses) * 100;
    if (topMerchantPercent > 10) {
      insights.push(
        `${report.topMerchants[0].merchant} was your top merchant at ${topMerchantPercent.toFixed(1)}% of total spending.`
      );
    }
  }

  return insights;
}
