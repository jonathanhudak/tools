import { CfnOutput, Duration, RemovalPolicy, Stack, type StackProps } from 'aws-cdk-lib';
import { Architecture, FunctionUrlAuthType, Runtime } from 'aws-cdk-lib/aws-lambda';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { NodejsFunction, OutputFormat } from 'aws-cdk-lib/aws-lambda-nodejs';
import { BlockPublicAccess, Bucket, BucketEncryption } from 'aws-cdk-lib/aws-s3';
import { Queue, QueueEncryption } from 'aws-cdk-lib/aws-sqs';
import type { Construct } from 'constructs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
/** Infra references Lambda entry points by PATH only - it never imports ring code. */
const lambdaEntry = (name: string): string => join(root, 'packages', 'composition', 'src', 'lambdas', `${name}.lambda.ts`);

export class CorpusStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const bucket = new Bucket(this, 'CorpusBucket', {
      encryption: BucketEncryption.S3_MANAGED,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      versioned: true,
      removalPolicy: RemovalPolicy.RETAIN,
    });

    const dlq = new Queue(this, 'IngestDLQ', {
      encryption: QueueEncryption.SQS_MANAGED,
      retentionPeriod: Duration.days(14),
      enforceSSL: true,
    });
    const queue = new Queue(this, 'IngestQueue', {
      encryption: QueueEncryption.SQS_MANAGED,
      visibilityTimeout: Duration.seconds(60),
      deadLetterQueue: { queue: dlq, maxReceiveCount: 3 },
      enforceSSL: true,
    });

    const common = {
      runtime: Runtime.NODEJS_22_X,
      architecture: Architecture.ARM_64,
      memorySize: 256,
      timeout: Duration.seconds(10),
      environment: { CORPUS_BUCKET: bucket.bucketName },
      depsLockFilePath: join(root, 'pnpm-lock.yaml'),
      projectRoot: root,
      bundling: { format: OutputFormat.ESM, target: 'node22', minify: true, sourceMap: true },
    } as const;

    const ingest = new NodejsFunction(this, 'IngestConsumer', {
      ...common,
      entry: lambdaEntry('sqs'),
      timeout: Duration.seconds(30),
      // The S3 search index is a single object: keep writes serial.
      reservedConcurrentExecutions: 1,
    });
    ingest.addEventSource(new SqsEventSource(queue, { batchSize: 10, reportBatchItemFailures: true }));
    bucket.grantReadWrite(ingest);

    const api = new NodejsFunction(this, 'HttpApi', { ...common, entry: lambdaEntry('http') });
    bucket.grantReadWrite(api);
    const url = api.addFunctionUrl({ authType: FunctionUrlAuthType.AWS_IAM });

    new CfnOutput(this, 'IngestQueueUrl', { value: queue.queueUrl });
    new CfnOutput(this, 'ApiUrl', { value: url.url });
  }
}
