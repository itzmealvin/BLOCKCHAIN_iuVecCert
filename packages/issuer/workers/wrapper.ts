import type { Proof } from "../models/Vector.ts";
import type { ChunkWorkerResponse } from "../models/Worker.ts";

/**
 * Worker thread wrapper for leaf chunks processing to be called in other places
 * @param coeffValues The coefficients for this vector commitment
 * @param commitValue The commitment for this vector commitment
 * @param leafChunk The leaf chunk to be processed
 */
export const runChunkWorker = (
  coeffValues: bigint[],
  commitValue: bigint[],
  leafChunk: Proof[],
): Promise<ChunkWorkerResponse> => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL("./chunkWorker.ts", import.meta.url).href,
      {
        type: "module",
      },
    );

    worker.postMessage({
      coeffValues,
      commitValue,
      leafChunk,
    });

    worker.onmessage = (event: MessageEvent) => {
      resolve(event.data as ChunkWorkerResponse);
      worker.terminate();
    };

    worker.onerror = (error: ErrorEvent) => {
      reject(error.message);
    };

    worker.onmessageerror = (_event: MessageEvent) => {
      reject(new Error("Message error in worker"));
    };
  });
};
