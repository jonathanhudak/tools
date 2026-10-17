import { type S3Client } from '@aws-sdk/client-s3';
import { type ComponentDoc, type SearchHit, type SearchIndexPort } from '@hex/domain';
/**
 * Toy index: one JSON object of `{ id: terms[] }` in S3. Fine for a starter and a
 * few thousand components; swap for OpenSearch/Bedrock KB behind the same port.
 * Not safe for concurrent writers (last write wins); infra pins the ingest Lambda to reserved concurrency 1.
 */
export declare class S3SearchIndex implements SearchIndexPort {
    private readonly s3;
    private readonly bucket;
    private readonly key;
    constructor(s3: S3Client, bucket: string, key?: string);
    private load;
    upsert(doc: ComponentDoc): Promise<void>;
    search(query: string, limit: number): Promise<readonly SearchHit[]>;
}
//# sourceMappingURL=s3-search-index.adapter.d.ts.map