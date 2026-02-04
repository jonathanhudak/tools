/**
 * JSON formatter for saving scan results
 */

import { writeFile } from 'fs/promises';
import { format } from 'date-fns';
import type { ScanResult } from '../types/index.js';

/**
 * Format scan results as JSON string
 */
export function formatJSON(result: ScanResult, pretty = true): string {
  if (pretty) {
    return JSON.stringify(result, null, 2);
  }
  return JSON.stringify(result);
}

/**
 * Save scan results to JSON file
 */
export async function saveJSON(
  result: ScanResult,
  filepath?: string
): Promise<string> {
  const filename =
    filepath ||
    `gap-scan-${format(result.timestamp, 'yyyy-MM-dd-HHmmss')}.json`;

  const json = formatJSON(result);
  await writeFile(filename, json, 'utf-8');

  return filename;
}

/**
 * Parse JSON scan result from file or string
 */
export function parseJSON(json: string): ScanResult {
  const parsed = JSON.parse(json);

  // Convert timestamp strings back to Date objects
  return {
    ...parsed,
    timestamp: new Date(parsed.timestamp),
    candidates: parsed.candidates.map((c: any) => ({
      ...c,
      timestamp: new Date(c.timestamp),
    })),
  };
}
