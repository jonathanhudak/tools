// Rule-based categorization engine

import type Database from 'better-sqlite3';
import type { Transaction, Category, CategorizationRule, CategoryResult } from '../core/types.js';
import { getAllRules, createRule, getAllCategories } from '../core/database.js';
import { DEFAULT_RULES } from './default-rules.js';

export class RuleEngine {
  private rules: CategorizationRule[] = [];
  private categories: Map<string, Category> = new Map();

  constructor(private db: Database.Database) {
    this.loadRules();
    this.loadCategories();
  }

  private loadRules(): void {
    this.rules = getAllRules(this.db);
  }

  private loadCategories(): void {
    const cats = getAllCategories(this.db);
    for (const cat of cats) {
      this.categories.set(cat.id, cat);
    }
  }

  public categorize(description: string): CategoryResult | null {
    const normalizedDesc = description.toLowerCase();

    let bestMatch: { rule: CategorizationRule; confidence: number } | null = null;

    for (const rule of this.rules) {
      const match = this.matchRule(normalizedDesc, rule);
      if (match && (!bestMatch || rule.priority > bestMatch.rule.priority)) {
        bestMatch = { rule, confidence: match };
      }
    }

    if (bestMatch) {
      return {
        categoryId: bestMatch.rule.categoryId,
        confidence: bestMatch.confidence,
      };
    }

    return null;
  }

  private matchRule(description: string, rule: CategorizationRule): number | null {
    switch (rule.matchType) {
      case 'exact':
        if (description === rule.pattern.toLowerCase()) {
          return 1.0;
        }
        break;

      case 'contains':
        if (description.includes(rule.pattern.toLowerCase())) {
          // Higher confidence for longer patterns (more specific)
          const specificity = Math.min(rule.pattern.length / 20, 1);
          return 0.7 + 0.3 * specificity;
        }
        break;

      case 'regex':
        try {
          const regex = new RegExp(rule.pattern, 'i');
          if (regex.test(description)) {
            return 0.85;
          }
        } catch {
          // Invalid regex, skip
        }
        break;
    }

    return null;
  }

  public addRule(
    pattern: string,
    matchType: CategorizationRule['matchType'],
    categoryId: string,
    priority: number = 0
  ): CategorizationRule {
    const rule = createRule(this.db, pattern, matchType, categoryId, priority);
    this.rules.push(rule);
    // Re-sort by priority
    this.rules.sort((a, b) => b.priority - a.priority);
    return rule;
  }

  public initializeDefaultRules(): number {
    let count = 0;
    for (const rule of DEFAULT_RULES) {
      // Check if rule already exists
      const exists = this.rules.some(
        (r) => r.pattern.toLowerCase() === rule.pattern.toLowerCase() && r.matchType === rule.matchType
      );
      if (!exists) {
        this.addRule(rule.pattern, rule.matchType, rule.categoryId, rule.priority);
        count++;
      }
    }
    return count;
  }

  public getCategory(id: string): Category | undefined {
    return this.categories.get(id);
  }

  public getAllCategories(): Category[] {
    return Array.from(this.categories.values());
  }
}
