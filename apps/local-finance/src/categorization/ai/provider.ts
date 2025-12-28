// AI Provider interface

import type { Category, CategoryResult, SpendingSummary } from '../../core/types.js';

export interface AIProvider {
  name: string;
  isAvailable(): Promise<boolean>;
  categorize(
    transaction: { description: string; amount: number },
    categories: Category[]
  ): Promise<CategoryResult | null>;
  normalizeMerchant(description: string): Promise<string>;
  generateInsights(summary: SpendingSummary): Promise<string[]>;
}

export function buildCategorizationPrompt(
  description: string,
  amount: number,
  categories: Category[]
): string {
  // Get top-level categories with their children
  const categoryList = categories
    .filter((c) => !c.parentId)
    .map((parent) => {
      const children = categories.filter((c) => c.parentId === parent.id);
      if (children.length > 0) {
        const childList = children.map((c) => c.id).join(', ');
        return `${parent.id} (${childList})`;
      }
      return parent.id;
    })
    .join('\n');

  return `Categorize this financial transaction.

Transaction: "${description}"
Amount: $${Math.abs(amount).toFixed(2)} (${amount < 0 ? 'expense' : 'income'})

Available categories (parent categories with subcategories in parentheses):
${categoryList}

Respond with ONLY the category ID (use the most specific subcategory when appropriate) and a confidence score from 0 to 1.
Format: category_id|confidence

Example responses:
groceries|0.95
streaming|0.88
restaurants|0.75

Response:`;
}

export function buildMerchantNormalizationPrompt(description: string): string {
  return `Extract the clean merchant/company name from this bank transaction description.

Transaction: "${description}"

Rules:
- Remove transaction IDs, reference numbers, and dates
- Remove location suffixes (city, state, etc.)
- Remove prefixes like "SQ *", "TST*", "PP*"
- Use proper capitalization
- Return just the company/merchant name

Examples:
- "AMAZON.COM*1A2B3C4D5 AMZN.COM/BILL WA" → "Amazon"
- "SQ *BLUE BOTTLE COFFEE" → "Blue Bottle Coffee"
- "TST* SHAKE SHACK #1234" → "Shake Shack"
- "NETFLIX.COM 866-579-7172 CA" → "Netflix"
- "WHOLEFDS MKT 10234 AUSTIN TX" → "Whole Foods Market"

Respond with ONLY the cleaned merchant name, nothing else.

Merchant name:`;
}

export function buildInsightsPrompt(summary: SpendingSummary): string {
  const categoryBreakdown = summary.byCategory
    .map((c) => `- ${c.categoryName}: $${Math.abs(c.amount).toFixed(2)}`)
    .join('\n');

  const topMerchants = summary.topMerchants
    .slice(0, 10)
    .map((m) => `- ${m.merchant}: $${Math.abs(m.amount).toFixed(2)} (${m.count} transactions)`)
    .join('\n');

  return `Analyze this spending summary and provide 3-5 actionable insights.

Period: ${summary.period}
Total Income: $${summary.totalIncome.toFixed(2)}
Total Expenses: $${Math.abs(summary.totalExpenses).toFixed(2)}
Net: $${(summary.totalIncome + summary.totalExpenses).toFixed(2)}

Spending by Category:
${categoryBreakdown}

Top Merchants:
${topMerchants}

Provide brief, specific, actionable insights. Focus on:
- Unusual spending patterns
- Potential savings opportunities
- Subscription optimization
- Budget recommendations

Format each insight on a new line starting with "•"

Insights:`;
}

export function parseCategoryResponse(response: string): CategoryResult | null {
  const cleaned = response.trim().toLowerCase();

  // Try to parse "category|confidence" format
  const parts = cleaned.split('|');
  if (parts.length >= 2) {
    const categoryId = parts[0].trim();
    const confidence = parseFloat(parts[1].trim());
    if (categoryId && !isNaN(confidence)) {
      return { categoryId, confidence: Math.min(Math.max(confidence, 0), 1) };
    }
  }

  // Try to extract just a category ID
  const words = cleaned.split(/\s+/);
  if (words.length > 0) {
    return { categoryId: words[0].replace(/[^a-z0-9-]/g, ''), confidence: 0.5 };
  }

  return null;
}

export function parseInsightsResponse(response: string): string[] {
  const lines = response.split('\n');
  const insights: string[] = [];

  for (const line of lines) {
    const cleaned = line.trim();
    if (cleaned.startsWith('•') || cleaned.startsWith('-') || cleaned.startsWith('*')) {
      insights.push(cleaned.slice(1).trim());
    } else if (cleaned.length > 20 && !cleaned.includes(':')) {
      // Might be an insight without a bullet
      insights.push(cleaned);
    }
  }

  return insights.slice(0, 5); // Max 5 insights
}
