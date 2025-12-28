// Google Gemini AI Provider

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Category, CategoryResult, SpendingSummary } from '../../core/types.js';
import type { AIProvider } from './provider.js';
import {
  buildCategorizationPrompt,
  buildMerchantNormalizationPrompt,
  buildInsightsPrompt,
  parseCategoryResponse,
  parseInsightsResponse,
} from './provider.js';

export class GeminiProvider implements AIProvider {
  name = 'gemini';
  private client: GoogleGenerativeAI;
  private model: string;

  constructor(apiKey: string, model: string = 'gemini-1.5-flash') {
    this.client = new GoogleGenerativeAI(apiKey);
    this.model = model;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const model = this.client.getGenerativeModel({ model: this.model });
      await model.generateContent('Hi');
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
      const model = this.client.getGenerativeModel({
        model: this.model,
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 50,
        },
      });

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return parseCategoryResponse(text);
    } catch (error) {
      console.error('Gemini categorization error:', error);
      return null;
    }
  }

  async normalizeMerchant(description: string): Promise<string> {
    const prompt = buildMerchantNormalizationPrompt(description);

    try {
      const model = this.client.getGenerativeModel({
        model: this.model,
        generationConfig: {
          temperature: 0,
          maxOutputTokens: 50,
        },
      });

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      return text.split('\n')[0].trim() || description;
    } catch (error) {
      console.error('Gemini normalization error:', error);
      return description;
    }
  }

  async generateInsights(summary: SpendingSummary): Promise<string[]> {
    const prompt = buildInsightsPrompt(summary);

    try {
      const model = this.client.getGenerativeModel({
        model: this.model,
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 500,
        },
      });

      const result = await model.generateContent(prompt);
      return parseInsightsResponse(result.response.text());
    } catch (error) {
      console.error('Gemini insights error:', error);
      return [];
    }
  }
}
