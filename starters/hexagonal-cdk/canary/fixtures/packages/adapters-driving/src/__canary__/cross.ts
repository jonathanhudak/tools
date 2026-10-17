// CANARY: a driving adapter constructing a driven adapter itself (wiring belongs in composition).
import { SystemClock } from '../../../adapters-driven/src/index.js';

export const clock = new SystemClock();
