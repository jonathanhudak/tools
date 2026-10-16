import { type S3Client } from '@aws-sdk/client-s3';
import type { ComponentDoc, ComponentId, ComponentRepoPort } from '@hex/domain';
/** Stores each ComponentDoc as `components/<id>.json`, keyed by id for direct lookup. */
export declare class S3ComponentRepo implements ComponentRepoPort {
    private readonly s3;
    private readonly bucket;
    private readonly prefix;
    constructor(s3: S3Client, bucket: string, prefix?: string);
    private key;
    save(doc: ComponentDoc): Promise<void>;
    get(id: ComponentId): Promise<ComponentDoc | null>;
}
//# sourceMappingURL=s3-component-repo.adapter.d.ts.map