// Bank profile detection from CSV headers

import type { BankProfile } from '../core/types.js';
import { ALL_PROFILES } from './profiles/index.js';

export interface DetectionResult {
  profile: BankProfile;
  confidence: number;
}

export function detectBankProfile(headers: string[]): DetectionResult | null {
  const normalizedHeaders = headers.map((h) => h.trim().toLowerCase());

  let bestMatch: DetectionResult | null = null;

  for (const profile of ALL_PROFILES) {
    for (const pattern of profile.patterns) {
      const normalizedPattern = pattern.headers.map((h) => h.toLowerCase());
      const confidence = calculateMatchConfidence(normalizedHeaders, normalizedPattern);

      if (confidence > 0 && (!bestMatch || confidence > bestMatch.confidence)) {
        bestMatch = { profile, confidence };
      }
    }
  }

  return bestMatch;
}

function calculateMatchConfidence(actual: string[], expected: string[]): number {
  if (actual.length === 0 || expected.length === 0) {
    return 0;
  }

  let matches = 0;
  let totalExpected = expected.length;

  for (const expectedHeader of expected) {
    // Check for exact match or partial match
    if (actual.includes(expectedHeader)) {
      matches++;
    } else {
      // Check for partial matches (header might have slightly different formatting)
      const partialMatch = actual.some(
        (h) => h.includes(expectedHeader) || expectedHeader.includes(h)
      );
      if (partialMatch) {
        matches += 0.5;
      }
    }
  }

  return matches / totalExpected;
}

export function getAllSupportedBanks(): { id: string; name: string }[] {
  const seen = new Set<string>();
  const banks: { id: string; name: string }[] = [];

  for (const profile of ALL_PROFILES) {
    // Get the base bank name (without -checking, -credit, etc.)
    const baseName = profile.name.split(' ')[0];
    if (!seen.has(baseName)) {
      seen.add(baseName);
      banks.push({ id: profile.id.split('-')[0], name: baseName });
    }
  }

  return banks;
}
