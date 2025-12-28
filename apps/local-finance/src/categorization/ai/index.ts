// AI Provider factory

import type { AIProvider } from './provider.js';
import type { AIConfig } from '../../core/types.js';
import { OllamaProvider } from './ollama.js';
import { AnthropicProvider } from './anthropic.js';
import { GeminiProvider } from './gemini.js';

export function createAIProvider(config: AIConfig): AIProvider {
  switch (config.provider) {
    case 'ollama':
      return new OllamaProvider(
        config.ollama?.host ?? 'http://localhost:11434',
        config.ollama?.model ?? 'llama3.2:3b'
      );

    case 'anthropic':
      if (!config.anthropic?.apiKey) {
        throw new Error('Anthropic API key not configured. Set ANTHROPIC_API_KEY or configure in ~/.local-finance/config.json');
      }
      return new AnthropicProvider(
        config.anthropic.apiKey,
        config.anthropic.model ?? 'claude-3-haiku-20240307'
      );

    case 'gemini':
      if (!config.gemini?.apiKey) {
        throw new Error('Gemini API key not configured. Set GOOGLE_AI_API_KEY or configure in ~/.local-finance/config.json');
      }
      return new GeminiProvider(
        config.gemini.apiKey,
        config.gemini.model ?? 'gemini-1.5-flash'
      );

    default:
      throw new Error(`Unknown AI provider: ${config.provider}`);
  }
}

export { OllamaProvider } from './ollama.js';
export { AnthropicProvider } from './anthropic.js';
export { GeminiProvider } from './gemini.js';
export type { AIProvider } from './provider.js';
