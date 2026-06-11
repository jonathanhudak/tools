/**
 * Spaced repetition scheduler (SM-2 lite) with localStorage persistence.
 *
 * Cards are identified by string IDs; decks construct their card content
 * at render time, so only scheduling state is stored.
 */

export type Grade = 'again' | 'hard' | 'good' | 'easy';

export interface CardState {
  /** Ease factor — multiplier applied to the interval on 'good' */
  ease: number;
  /** Current interval in days (0 = learning, due again this session) */
  intervalDays: number;
  /** Epoch ms when the card is next due */
  due: number;
  /** Successful repetitions in a row */
  reps: number;
}

export const NEW_CARD: CardState = { ease: 2.5, intervalDays: 0, due: 0, reps: 0 };

const DAY_MS = 24 * 60 * 60 * 1000;
const LEARNING_AGAIN_MS = 5 * 60 * 1000; // 'again' → resurface in ~5 minutes

/** Pure SM-2-lite transition. `now` is injectable for tests. */
export function gradeCard(state: CardState, grade: Grade, now = Date.now()): CardState {
  const s = { ...state };
  switch (grade) {
    case 'again':
      s.reps = 0;
      s.intervalDays = 0;
      s.ease = Math.max(1.3, s.ease - 0.2);
      s.due = now + LEARNING_AGAIN_MS;
      return s;
    case 'hard':
      s.intervalDays = Math.max(1, s.intervalDays * 1.2);
      s.ease = Math.max(1.3, s.ease - 0.15);
      break;
    case 'good':
      s.intervalDays = s.reps === 0 ? 1 : Math.max(1, s.intervalDays * s.ease);
      break;
    case 'easy':
      s.intervalDays = Math.max(2, s.intervalDays * s.ease * 1.3);
      s.ease = s.ease + 0.15;
      break;
  }
  s.reps += 1;
  s.intervalDays = Math.round(s.intervalDays * 10) / 10;
  s.due = now + s.intervalDays * DAY_MS;
  return s;
}

// ─── Persistence ─────────────────────────────────────────────────────────────

const STORAGE_KEY = 'music_practice_srs';

export type SrsStore = Record<string, CardState>;

export function loadSrs(): SrsStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SrsStore) : {};
  } catch {
    return {};
  }
}

export function saveSrs(store: SrsStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // storage full or unavailable — review still works in memory
  }
}

/**
 * Build today's queue: due cards first (oldest due first), then up to
 * `newLimit` never-seen cards.
 */
export function buildQueue(
  allIds: string[],
  store: SrsStore,
  newLimit = 10,
  now = Date.now(),
): string[] {
  const due = allIds
    .filter(id => store[id] && store[id].due <= now)
    .sort((a, b) => store[a].due - store[b].due);
  const fresh = allIds.filter(id => !store[id]).slice(0, newLimit);
  return [...due, ...fresh];
}

/** Count due + new cards without building card content. */
export function queueCounts(
  allIds: string[],
  store: SrsStore,
  newLimit = 10,
  now = Date.now(),
): { due: number; fresh: number } {
  const due = allIds.filter(id => store[id] && store[id].due <= now).length;
  const fresh = Math.min(newLimit, allIds.filter(id => !store[id]).length);
  return { due, fresh };
}
