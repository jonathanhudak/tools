import {
  normalizeComponent,
  type ClockPort,
  type ComponentDoc,
  type ComponentRepoPort,
  type DomainError,
  type FigmaComponentInput,
  type Result,
  type SearchIndexPort,
} from '@hex/domain';

export interface IndexComponentDeps {
  readonly repo: ComponentRepoPort;
  readonly index: SearchIndexPort;
  readonly clock: ClockPort;
}

/** Ingest a Figma component node: normalize -> store -> make searchable. */
export class IndexComponent {
  constructor(private readonly deps: IndexComponentDeps) {}

  async execute(input: FigmaComponentInput): Promise<Result<ComponentDoc, DomainError>> {
    const result = normalizeComponent(input, this.deps.clock.now());
    if (!result.ok) return result;
    await this.deps.repo.save(result.value);
    await this.deps.index.upsert(result.value);
    return result;
  }
}
