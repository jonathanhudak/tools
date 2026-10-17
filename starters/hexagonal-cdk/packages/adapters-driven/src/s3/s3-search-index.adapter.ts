import { GetObjectCommand, NoSuchKey, PutObjectCommand, type S3Client } from '@aws-sdk/client-s3';
import { score, searchableTerms, type ComponentDoc, type SearchHit, type SearchIndexPort } from '@hex/domain';

type Snapshot = Record<string, readonly string[]>;

/**
 * Toy index: one JSON object of `{ id: terms[] }` in S3. Fine for a starter and a
 * few thousand components; swap for OpenSearch/Bedrock KB behind the same port.
 * Not safe for concurrent writers (last write wins); infra pins the ingest Lambda to reserved concurrency 1.
 */
export class S3SearchIndex implements SearchIndexPort {
  constructor(
    private readonly s3: S3Client,
    private readonly bucket: string,
    private readonly key = 'index/terms.json',
  ) {}

  private async load(): Promise<Snapshot> {
    try {
      const res = await this.s3.send(new GetObjectCommand({ Bucket: this.bucket, Key: this.key }));
      const body = await res.Body?.transformToString();
      return body ? (JSON.parse(body) as Snapshot) : {};
    } catch (e) {
      if (e instanceof NoSuchKey) return {};
      throw e;
    }
  }

  async upsert(doc: ComponentDoc): Promise<void> {
    const snapshot = await this.load();
    snapshot[doc.id] = searchableTerms(doc);
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: this.key,
        Body: JSON.stringify(snapshot),
        ContentType: 'application/json',
      }),
    );
  }

  async search(query: string, limit: number): Promise<readonly SearchHit[]> {
    const snapshot = await this.load();
    return Object.entries(snapshot)
      .map(([id, terms]) => ({ id: id as ComponentDoc['id'], score: score(terms, query) }))
      .filter((hit) => hit.score > 0)
      .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
      .slice(0, limit);
  }
}
