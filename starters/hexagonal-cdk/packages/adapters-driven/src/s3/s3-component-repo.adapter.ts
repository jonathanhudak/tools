import { GetObjectCommand, NoSuchKey, PutObjectCommand, type S3Client } from '@aws-sdk/client-s3';
import type { ComponentDoc, ComponentId, ComponentRepoPort } from '@hex/domain';

/** Stores each ComponentDoc as `components/<id>.json`, keyed by id for direct lookup. */
export class S3ComponentRepo implements ComponentRepoPort {
  constructor(
    private readonly s3: S3Client,
    private readonly bucket: string,
    private readonly prefix = 'components/',
  ) {}

  private key(id: ComponentId): string {
    return `${this.prefix}${encodeURIComponent(id)}.json`;
  }

  async save(doc: ComponentDoc): Promise<void> {
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: this.key(doc.id),
        Body: JSON.stringify(doc),
        ContentType: 'application/json',
      }),
    );
  }

  async get(id: ComponentId): Promise<ComponentDoc | null> {
    try {
      const res = await this.s3.send(new GetObjectCommand({ Bucket: this.bucket, Key: this.key(id) }));
      const body = await res.Body?.transformToString();
      return body ? (JSON.parse(body) as ComponentDoc) : null;
    } catch (e) {
      if (e instanceof NoSuchKey) return null;
      throw e;
    }
  }
}
