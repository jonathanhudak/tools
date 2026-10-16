// CANARY: domain reaching into an adapter by relative path (bypasses package.json).
import { S3ComponentRepo } from '../../../adapters-driven/src/index.js';

export const leaked = S3ComponentRepo;
