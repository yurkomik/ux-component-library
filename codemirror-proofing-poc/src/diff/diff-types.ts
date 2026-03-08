export type DiffKind = "equal" | "insert" | "delete";

export interface DiffChunk {
  kind: DiffKind;
  text: string;
}
