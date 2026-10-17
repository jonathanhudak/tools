// CANARY: a use-case ring talking to AWS directly instead of through a port.
import { S3Client } from '@aws-sdk/client-s3';

export const client = new S3Client({});
