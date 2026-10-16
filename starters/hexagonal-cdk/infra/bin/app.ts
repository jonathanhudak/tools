import { App } from 'aws-cdk-lib';
import { CorpusStack } from '../lib/corpus-stack.js';

const app = new App();
new CorpusStack(app, 'HexCorpus', {
  // Environment-agnostic so `cdk synth` works offline with no AWS credentials.
  description: 'Hexagonal starter: Figma component corpus (S3 + SQS + Lambda)',
});
