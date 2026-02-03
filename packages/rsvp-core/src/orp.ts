import type { ORPInfo, WordParts } from './types';

/**
 * Calculate the Optimal Recognition Point (ORP) for a word.
 * The ORP is the character that should be focused on for optimal reading speed.
 * Typically positioned at approximately 1/3 of the word length.
 *
 * @param word - The word to analyze
 * @returns ORP information including the index and leading punctuation count
 *
 * @example
 * ```ts
 * getORPInfo("example")  // { orpIndex: 2, leadingPunctCount: 0 } - the 'a'
 * getORPInfo('"hello"')  // { orpIndex: 2, leadingPunctCount: 1 } - the 'e'
 * ```
 */
export function getORPInfo(word: string): ORPInfo {
  // Find leading punctuation
  const leadingMatch = word.match(/^[^\w]+/);
  const leadingPunctCount = leadingMatch ? leadingMatch[0].length : 0;

  // Remove leading/trailing punctuation for ORP calculation
  const cleanWord = word.replace(/^[^\w]+|[^\w]+$/g, '');
  if (cleanWord.length === 0) {
    return { orpIndex: 0, leadingPunctCount: 0 };
  }

  // ORP is typically at 1/3 of the word length (floored)
  // For "example" (7 letters), ORP is at index 2 (the 'a')
  const cleanOrpIndex = Math.floor(cleanWord.length / 3);

  // Adjust for leading punctuation to get the correct index in the original word
  const actualOrpIndex = cleanOrpIndex + leadingPunctCount;

  return { orpIndex: actualOrpIndex, leadingPunctCount };
}

/**
 * Split a word into parts based on its ORP for rendering.
 * Useful for highlighting the ORP character differently.
 *
 * @param word - The word to split
 * @returns Word parts: before ORP, ORP letter, and after ORP
 *
 * @example
 * ```ts
 * splitWordByORP("example")
 * // {
 * //   beforeORP: "ex",
 * //   orpLetter: "a",
 * //   afterORP: "mple",
 * //   fullWord: "example"
 * // }
 * ```
 */
export function splitWordByORP(word: string): WordParts {
  const { orpIndex } = getORPInfo(word);

  const beforeORP = word.slice(0, orpIndex);
  const orpLetter = word[orpIndex] || '';
  const afterORP = word.slice(orpIndex + 1);

  return {
    beforeORP,
    orpLetter,
    afterORP,
    fullWord: word,
  };
}

/**
 * Calculate the transform shift needed to center the ORP character.
 * Used for "zero-jiggle" display in monospace fonts.
 *
 * @param word - The word being displayed
 * @param orpIndex - The ORP index in the word
 * @returns The shift value in character units (for use with `ch` CSS unit)
 *
 * @example
 * ```ts
 * // For centering in a monospace font:
 * const shift = calculateORPShift("example", 2);
 * // CSS: transform: `translateX(calc(${shift} * 1ch))`
 * ```
 */
export function calculateORPShift(word: string, orpIndex: number): number {
  // Formula: shift = (wordLength / 2) - orpIndex - 0.5
  // The -0.5 accounts for character center positioning
  return (word.length / 2) - orpIndex - 0.5;
}
