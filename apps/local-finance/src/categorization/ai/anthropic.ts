// Anthropic AI Provider

import Anthropic from '@anthropic-ai/sdk';
import type { Category, CategoryResult, SpendingSummary } from '../../core/types.js';
import type { AIProvider } from './provider.js';
import {
  buildCategorizationPrompt,
  buildMerchantNormalizationPrompt,
  buildInsightsPrompt,
  parseCategoryResponse,
  parseInsightsResponse,
} from './provider.js';

export class AnthropicProvider implements AIProvider {
  name = 'anthropic';
  private client: Anthropic;
  private model: string;

  constructor(apiKey: string, model: string = 'claude-3-haiku-20240307') {
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  async isAvailable(): Promise<boolean> {
    try {
      // Simple check - try a minimal request
      await this.client.messages.create({
        model: this.model,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hi' }],
      });
      return true;
    } catch {
      return false;
    }
  }

  async categorize(
    transaction: { description: string; amount: number },
    categories: Category[]
  ): Promise<CategoryResult | null> {
    const prompt = buildCategorizationPrompt(transaction.description, transaction.amount, categories);

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 50,
        messages: [{ role: 'user', content: prompt }],
      });

      const text = response.content[0].type === 'text' ? response.content[0].text : '';
      return parseCategoryResponse(text);
    } catch (error) {
      console.error('Anthropic categorization error:', error);
      return null;
    }
  }

  async normalizeMerchant(description: string): Promise<string> {
    const prompt = buildMerchantNormalizationPrompt(description);

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 50,
        messages: [{ role: 'user', content: prompt }],
      });

      const text = response.content[0].type === 'text' ? response.content[0].text : '';
      const cleaned = text.trim();
      return cleaned.split('\n')[0].trim() || description;
    } catch (error) {
      console.error('Anthropic normalization error:', error);
      return description;
    }
  }

  async generateInsights(summary: SpendingSummary): Promise<string[]> {
    const prompt = buildInsightsPrompt(summary);

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }],
      });

      const text = response.content[0].type === 'text' ? response.content[0].text : '';
      return parseInsightsResponse(text);
    } catch (error) {
      console.error('Anthropic insights error:', error);
      return [];
    }
  }
}
