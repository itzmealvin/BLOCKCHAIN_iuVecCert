import { parentPort, workerData } from "worker_threads";
import  FileParamsDto  from "../dtos/FileParamsDto";
import { genProof, genVerifierContractParams } from "../libs/lib-kzg";

function genProofs(
  coeffs: bigint[],
  chunks: FileParamsDto[],
  commit: bigint[],
): FileParamsDto[] {
  return chunks.map(({ fileIndex, fileHash }) => {
    const proof = genProof(coeffs, parseInt(fileIndex));
    const params = genVerifierContractParams(
      commit,
      proof,
      parseInt(fileIndex),
      BigInt(fileHash),
    );
    console.log(`WORKER: Proof for ${fileIndex} generated`);
    return {
      fileProof: params.proof,
      fileIndex: params.index,
      fileHash: params.value,
    };
  });
}

// Post the results back to the parent thread
parentPort!.postMessage(
  genProofs(workerData.coeffs, workerData.chunks, workerData.commit),
);