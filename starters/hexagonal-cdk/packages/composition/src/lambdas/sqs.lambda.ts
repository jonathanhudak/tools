import { makeSqsConsumer } from '@hex/adapters-driving';
import { awsPorts, buildUseCases } from '../container.js';

export const handler = makeSqsConsumer(buildUseCases(awsPorts(process.env)), (message, detail) =>
  console.log(JSON.stringify({ level: 'info', message, ...detail })),
);
