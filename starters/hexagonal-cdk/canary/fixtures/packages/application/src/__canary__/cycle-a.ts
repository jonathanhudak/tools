// CANARY: circular import (a -> b -> a).
import { b } from './cycle-b.js';

export const a = (): string => `a${b.length}`;
