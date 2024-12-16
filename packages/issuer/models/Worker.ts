import type { Proof } from "./Vector.ts";

export interface ChunkWorkerData {
  data: {
    coeffValues: bigint[];
    commitValue: bigint[];
    leafChunk: Proof[];
  };
}

export interface ChunkWorkerResponse {
  proof: string[];
  index: string;
  value: string;
}
