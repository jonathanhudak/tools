import { S3Client } from '@aws-sdk/client-s3';
import { S3ComponentRepo, S3SearchIndex, SystemClock } from '@hex/adapters-driven';
import { IndexComponent, SearchComponents } from '@hex/application';
import type { ClockPort, ComponentRepoPort, SearchIndexPort } from '@hex/domain';

export interface Ports {
  readonly repo: ComponentRepoPort;
  readonly index: SearchIndexPort;
  readonly clock: ClockPort;
}

export interface UseCases {
  readonly indexComponent: IndexComponent;
  readonly searchComponents: SearchComponents;
}

/** Pure wiring: ports in, use cases out. Tests call this with in-memory adapters. */
export const buildUseCases = (ports: Ports): UseCases => ({
  indexComponent: new IndexComponent(ports),
  searchComponents: new SearchComponents(ports),
});

/** Production ports, configured from the Lambda environment. */
export const awsPorts = (env: Readonly<Record<string, string | undefined>>): Ports => {
  const bucket = env['CORPUS_BUCKET'];
  if (!bucket) throw new Error('CORPUS_BUCKET is not set');
  const s3 = new S3Client({});
  return {
    repo: new S3ComponentRepo(s3, bucket),
    index: new S3SearchIndex(s3, bucket),
    clock: new SystemClock(),
  };
};
