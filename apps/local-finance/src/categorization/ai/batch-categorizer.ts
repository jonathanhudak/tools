// Batch AI categorization for efficiency
// Uses Anthropic Claude for batch processing
import Anthropic from '@anthropic-ai/sdk';
import type { Transaction, Category } from '../../core/types.js';

export interface BatchResult {
  transactionId: number;
  categoryId: string;
  confidence: number;
  normalizedMerchant?: string;
}

export class BatchCategorizer {
  private client: Anthropic;
  private batchSize: number;

  constructor(
    apiKey: string,
    private categories: Category[],
    batchSize = 100
  ) {
    this.client = new Anthropic({ apiKey });
    this.batchSize = batchSize;
  }

  async categorizeMany(transactions: Transaction[]): Promise<BatchResult[]> {
    const results: BatchResult[] = [];

    // Process in batches
    for (let i = 0; i < transactions.length; i += this.batchSize) {
      const batch = transactions.slice(i, i + this.batchSize);
      console.log(`Processing batch ${Math.floor(i / this.batchSize) + 1}/${Math.ceil(transactions.length / this.batchSize)} (${batch.length} transactions)...`);
      const batchResults = await this.categorizeBatch(batch);
      results.push(...batchResults);
    }

    return results;
  }

  private async categorizeBatch(transactions: Transaction[]): Promise<BatchResult[]> {
    // Build category list
    const categoryList = this.categories
      .filter(c => !c.isIncome)
      .map(c => {
        if (c.parentId) {
          const parent = this.categories.find(p => p.id === c.parentId);
          return `- ${c.id}: ${parent?.name} > ${c.name}`;
        }
        return `- ${c.id}: ${c.name}`;
      })
      .join('\n');

    // Build transaction list
    const transactionList = transactions
      .map(tx => ({
        id: tx.id,
        description: tx.description,
        amount: Math.abs(tx.amount).toFixed(2)
      }))
      .map(tx => `{"id": ${tx.id}, "description": "${tx.description.replace(/"/g, '\\"')}", "amount": "${tx.amount}"}`)
      .join(',\n');

    const prompt = `Categorize these financial transactions. Return ONLY valid JSON, no explanations.

Available Categories:
${categoryList}

Transactions (JSON array):
[
${transactionList}
]

For EACH transaction above, return a JSON array with this EXACT format:
[
  {"id": <transaction_id>, "categoryId": "<category_id>", "confidence": <0.0-1.0>, "merchant": "<clean_merchant_name>"}
]

Rules:
- Use the most specific category
- confidence: 0.0 to 1.0 (higher = more certain)
- merchant: clean name (e.g., "AMAZON MKTPL*AB123" → "Amazon")
- Include ALL ${transactions.length} transactions
- Return ONLY the JSON array, nothing else`;

    try {
      const response = await this.client.messages.create({
        model: 'claude-opus-4-5-20251101',
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        console.warn('Unexpected response type');
        return [];
      }

      // Extract JSON from response
      const text = content.text;
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        console.warn('AI did not return valid JSON array');
        console.log('Response:', text.slice(0, 500));
        return [];
      }

      const parsed = JSON.parse(jsonMatch[0]) as Array<{
        id: number;
        categoryId: string;
        confidence: number;
        merchant?: string;
      }>;

      // Validate and map results
      const results: BatchResult[] = [];
      for (const item of parsed) {
        // Verify category exists
        const category = this.categories.find(c => c.id === item.categoryId);
        if (!category) {
          console.warn(`Unknown category "${item.categoryId}" for transaction ${item.id}, skipping`);
          continue;
        }

        results.push({
          transactionId: item.id,
          categoryId: item.categoryId,
          confidence: Math.min(Math.max(item.confidence, 0), 1), // Clamp 0-1
          normalizedMerchant: item.merchant,
        });
      }

      console.log(`  ✓ Categorized ${results.length}/${transactions.length} transactions`);
      return results;

    } catch (error) {
      console.error('Batch categorization error:', error);
      return [];
    }
  }
}
