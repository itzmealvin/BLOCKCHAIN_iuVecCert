import { parentPort, workerData } from "worker_threads";
import  FileParamsDto  from "../dtos/FileParamsDto";
import { genProof, genVerifierContractParams } from "../libs/lib-kzg";

function genProofs(
  coeffs: bigint[],
  chunks: FileParamsDto[],
  commit: bigint[],
) {
  const results: FileParamsDto[] = [];
  for (let i = 0; i < chunks.length; i++) {
    const { fileIndex, fileHash } = chunks[i];
    const proof = genProof(coeffs, parseInt(fileIndex));
    const params = genVerifierContractParams(
      commit,
      proof,
      parseInt(fileIndex),
      BigInt(fileHash),
    );
    results.push({
      fileProof: params.proof,
      fileIndex: params.index,
      fileHash: params.value,
    });
  }
  return results;
}

parentPort!.postMessage(
  genProofs(workerData.coeffs, workerData.chunks, workerData.commit),
);