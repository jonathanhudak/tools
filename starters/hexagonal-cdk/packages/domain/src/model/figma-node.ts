/**
 * The subset of a Figma REST API node the domain understands. Driving adapters
 * translate whatever arrives over the wire into this shape; the domain never
 * sees transport details.
 */
export interface FigmaComponentPropertyDefinition {
  readonly type: 'BOOLEAN' | 'TEXT' | 'INSTANCE_SWAP' | 'VARIANT';
  readonly defaultValue?: string | boolean;
  readonly variantOptions?: readonly string[];
}

export interface FigmaNode {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  readonly description?: string;
  readonly componentPropertyDefinitions?: Readonly<Record<string, FigmaComponentPropertyDefinition>>;
  readonly boundVariables?: Readonly<Record<string, unknown>>;
  readonly children?: readonly FigmaNode[];
}

export interface FigmaComponentInput {
  readonly fileKey: string;
  readonly node: FigmaNode;
}
