import type { IndexComponent } from '@hex/application';
import type { SQSBatchResponse, SQSEvent } from 'aws-lambda';
import { parseFigmaInput } from '../shared/parse-figma-input.js';

export interface SqsConsumerDeps {
  readonly indexComponent: IndexComponent;
}

export type SqsLogger = (message: string, detail: Record<string, unknown>) => void;

/**
 * SQS consumer with partial-batch failure reporting.
 * Malformed or domain-invalid messages are dropped (logged) - retrying cannot fix them.
 * Infrastructure errors (thrown) are reported back so SQS redelivers / dead-letters.
 */
export const makeSqsConsumer =
  ({ indexComponent }: SqsConsumerDeps, log: SqsLogger) =>
  async (event: SQSEvent): Promise<SQSBatchResponse> => {
    const failures: SQSBatchResponse['batchItemFailures'] = [];
    for (const record of event.Records) {
      const input = parseFigmaInput(record.body);
      if (!input) {
        log('dropping malformed message', { messageId: record.messageId });
        continue;
      }
      try {
        const result = await indexComponent.execute(input);
        if (!result.ok) log('dropping invalid component', { messageId: record.messageId, error: result.error });
      } catch (e) {
        log('transient failure', { messageId: record.messageId, error: String(e) });
        failures.push({ itemIdentifier: record.messageId });
      }
    }
    return { batchItemFailures: failures };
  };
