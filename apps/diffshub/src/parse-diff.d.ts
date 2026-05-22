declare module 'parse-diff' {
  export interface NormalChange {
    type: 'normal';
    ln1: number;
    ln2: number;
    normal: true;
    content: string;
  }
  export interface AddChange {
    type: 'add';
    ln: number;
    add: true;
    content: string;
  }
  export interface DeleteChange {
    type: 'del';
    ln: number;
    del: true;
    content: string;
  }
  export type Change = NormalChange | AddChange | DeleteChange;

  export interface Chunk {
    content: string;
    changes: Change[];
    oldStart: number;
    oldLines: number;
    newStart: number;
    newLines: number;
  }

  export interface File {
    chunks: Chunk[];
    deletions: number;
    additions: number;
    from?: string;
    to?: string;
    index?: string[];
    deleted?: boolean;
    new?: boolean;
    oldMode?: string;
    newMode?: string;
  }

  export default function parseDiff(input: string): File[];
}
