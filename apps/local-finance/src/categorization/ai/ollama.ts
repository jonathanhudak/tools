// Ollama AI Provider

import { Ollama } from 'ollama';
import type { Category, CategoryResult, SpendingSummary } from '../../core/types.js';
import type { AIProvider } from './provider.js';
import {
  buildCategorizationPrompt,
  buildMerchantNormalizationPrompt,
  buildInsightsPrompt,
  parseCategoryResponse,
  parseInsightsResponse,
} from './provider.js';

export class OllamaProvider implements AIProvider {
  name = 'ollama';
  private client: Ollama;
  private model: string;

  constructor(host: string = 'http://localhost:11434', model: string = 'llama3.2:3b') {
    this.client = new Ollama({ host });
    this.model = model;
  }

  async isAvailable(): Promise<boolean> {
    try {
      await this.client.list();
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
      const response = await this.client.generate({
        model: this.model,
        prompt,
        options: {
          temperature: 0.1,
          num_predict: 50,
        },
      });

      return parseCategoryResponse(response.response);
    } catch (error) {
      console.error('Ollama categorization error:', error);
      return null;
    }
  }

  async normalizeMerchant(description: string): Promise<string> {
    const prompt = buildMerchantNormalizationPrompt(description);

    try {
      const response = await this.client.generate({
        model: this.model,
        prompt,
        options: {
          temperature: 0,
          num_predict: 50,
        },
      });

      const cleaned = response.response.trim();
      // Take first line only
      return cleaned.split('\n')[0].trim() || description;
    } catch (error) {
      console.error('Ollama normalization error:', error);
      return description;
    }
  }

  async generateInsights(summary: SpendingSummary): Promise<string[]> {
    const prompt = buildInsightsPrompt(summary);

    try {
      const response = await this.client.generate({
        model: this.model,
        prompt,
        options: {
          temperature: 0.3,
          num_predict: 500,
        },
      });

      return parseInsightsResponse(response.response);
    } catch (error) {
      console.error('Ollama insights error:', error);
      return [];
    }
  }
}
