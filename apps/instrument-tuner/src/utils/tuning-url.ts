import {
  type Tuning,
  parseTuningString,
  createCustomTuning,
  findTuningById,
  findTuningByNotes,
  serializeTuning,
} from '../data/tunings';

export interface TuningUrlParams {
  tuningId?: string; // Preset tuning ID
  notes?: string; // Custom notes string (E2-A2-D3-G3-B3-E4)
  name?: string; // Custom tuning name
}

/**
 * Parse tuning params from URL search params
 */
export function parseTuningFromUrl(searchParams: URLSearchParams): TuningUrlParams {
  return {
    tuningId: searchParams.get('tuning') || undefined,
    notes: searchParams.get('notes') || undefined,
    name: searchParams.get('name') || undefined,
  };
}

/**
 * Get tuning from URL params
 * Priority: tuningId > notes > null
 */
export function getTuningFromParams(params: TuningUrlParams): Tuning | null {
  // First try preset by ID
  if (params.tuningId) {
    const preset = findTuningById(params.tuningId);
    if (preset) return preset;
  }

  // Then try custom notes
  if (params.notes) {
    const noteStrings = parseTuningString(params.notes);
    if (noteStrings.length > 0) {
      // First check if it matches a preset
      const preset = findTuningByNotes(noteStrings);
      if (preset) return preset;

      // Otherwise create custom tuning
      return createCustomTuning(noteStrings, params.name || 'Custom Tuning');
    }
  }

  return null;
}

/**
 * Create URL search params for a tuning
 */
export function createTuningUrlParams(
  tuning: Tuning,
  options: { includePresetId?: boolean } = {}
): URLSearchParams {
  const params = new URLSearchParams();

  // Check if this is a preset tuning
  const isPreset = !tuning.id.startsWith('custom-');

  if (isPreset && options.includePresetId !== false) {
    params.set('tuning', tuning.id);
  } else {
    // Serialize notes for custom or when explicitly requested
    params.set('notes', serializeTuning(tuning));
    if (tuning.name && tuning.name !== 'Custom Tuning') {
      params.set('name', tuning.name);
    }
  }

  return params;
}

/**
 * Create a full shareable URL for a tuning
 */
export function createShareableUrl(tuning: Tuning, baseUrl?: string): string {
  const base = baseUrl || window.location.origin + window.location.pathname;
  const params = createTuningUrlParams(tuning, { includePresetId: true });
  return `${base}?${params.toString()}`;
}

/**
 * Copy shareable URL to clipboard
 */
export async function copyShareableUrl(tuning: Tuning): Promise<boolean> {
  try {
    const url = createShareableUrl(tuning);
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Update URL with current tuning (without navigation)
 */
export function updateUrlWithTuning(tuning: Tuning): void {
  const params = createTuningUrlParams(tuning, { includePresetId: true });
  const newUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState({}, '', newUrl);
}

/**
 * Clear tuning from URL
 */
export function clearTuningFromUrl(): void {
  window.history.replaceState({}, '', window.location.pathname);
}
