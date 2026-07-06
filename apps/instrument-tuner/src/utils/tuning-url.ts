import {
  type Tuning,
  parseTuningString,
  createCustomTuning,
  findTuningById,
  findTuningByNotes,
  serializeTuning,
  STANDARD_A4,
  MIN_REFERENCE_PITCH,
  MAX_REFERENCE_PITCH,
} from '@hudak/tuning-data';

export interface TuningUrlParams {
  tuningId?: string; // Preset tuning ID
  notes?: string; // Custom notes string (E2-A2-D3-G3-B3-E4)
  name?: string; // Custom tuning name
  a4?: number; // A4 reference pitch in Hz (only when it differs from 440)
}

/**
 * Parse the a4 search param — accept only a finite number in the valid range
 */
function parseA4Param(value: string | null): number | undefined {
  if (!value) return undefined;
  const a4 = Number(value);
  if (!Number.isFinite(a4)) return undefined;
  if (a4 < MIN_REFERENCE_PITCH || a4 > MAX_REFERENCE_PITCH) return undefined;
  return a4;
}

/**
 * Parse tuning params from URL search params
 */
export function parseTuningFromUrl(searchParams: URLSearchParams): TuningUrlParams {
  return {
    tuningId: searchParams.get('tuning') || undefined,
    notes: searchParams.get('notes') || undefined,
    name: searchParams.get('name') || undefined,
    a4: parseA4Param(searchParams.get('a4')),
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
  options: { includePresetId?: boolean; a4?: number } = {}
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

  // Only pin A4 when it differs from the 440 standard
  if (options.a4 !== undefined && options.a4 !== STANDARD_A4) {
    params.set('a4', String(options.a4));
  }

  return params;
}

/**
 * Create a full shareable URL for a tuning
 */
export function createShareableUrl(tuning: Tuning, baseUrl?: string, a4?: number): string {
  const base = baseUrl || window.location.origin + window.location.pathname;
  const params = createTuningUrlParams(tuning, { includePresetId: true, a4 });
  return `${base}?${params.toString()}`;
}

/**
 * Update URL with current tuning (without navigation)
 */
export function updateUrlWithTuning(tuning: Tuning, a4?: number): void {
  const params = createTuningUrlParams(tuning, { includePresetId: true, a4 });
  const newUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState({}, '', newUrl);
}

/**
 * Clear tuning from URL
 */
export function clearTuningFromUrl(): void {
  window.history.replaceState({}, '', window.location.pathname);
}
