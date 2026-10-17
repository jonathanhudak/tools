// CANARY: circular import (b -> a -> b).
import { a } from './cycle-a.js';

export const b = [a];
