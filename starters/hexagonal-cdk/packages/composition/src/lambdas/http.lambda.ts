import { makeHttpHandler } from '@hex/adapters-driving';
import { awsPorts, buildUseCases } from '../container.js';

export const handler = makeHttpHandler(buildUseCases(awsPorts(process.env)));
