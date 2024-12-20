import { createHash, randomBytes } from "node:crypto";
import {
  genProof,
  genVerifierContractParams,
  type Proof,
} from "../libs/kzg.ts";
import type { ChunkWorkerData } from "../models/Worker.ts";

const worker = self as unknown as Worker;

/**
 * Chunk the array for multiprocessing
 * @param array The source array to be chunked
 * @param numberOfChunks The number of chunks to be divided by
 */
export const chunkArray = <T>(array: T[], numberOfChunks: number): T[][] => {
  const chunkSize = Math.ceil(array.length / numberOfChunks);
  const chunks: T[][] = [];

  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }

  return chunks;
};

/**
 * Generate a random challenge index using Fiat-Shamir heuristics
 * @param commitment The commitment for this vector commitment
 */
export const genChallengeIndex = (commitment: bigint[]): bigint => {
  const hash = createHash("sha224");
  const randomPart = randomBytes(16).toString("hex");
  hash.update(commitment.join(",") + randomPart);
  return BigInt("0x" + hash.digest("hex"));
};

/**
 * The function to be call when worker threads receive data
 * @param workerData The worker data sent to this worker thread
 */
worker.onmessage = (workerData: ChunkWorkerData) => {
  const { coeffValues, commitValue, leafChunk } = workerData.data;

  const results = leafChunk.map((point: Proof) => {
    const pointProof = genProof(coeffValues, BigInt(point.index));

    const pointParams = genVerifierContractParams(
      commitValue,
      pointProof,
      BigInt(point.index),
      BigInt(point.value),
    );

    return {
      proof: pointParams.proof,
      index: pointParams.index,
      value: pointParams.value,
    };
  });
  worker.postMessage(results);
  self.close();
};
