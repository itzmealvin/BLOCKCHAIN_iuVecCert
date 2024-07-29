import { parentPort, workerData } from "worker_threads";
import  FileParamsDto  from "../dtos/FileParamsDto";
import { genProof, genVerifierContractParams } from "../libs/lib-kzg";

function genProofs(
  coeffs: bigint[],
  chunk: FileParamsDto,
  commit: bigint[],
): FileParamsDto {
  const { fileIndex, fileHash } = chunk;
  const proof = genProof(coeffs, parseInt(fileIndex));
  const params = genVerifierContractParams(
    commit,
    proof,
    parseInt(fileIndex),
    BigInt(fileHash),
  );
  return {
    ...chunk,
    fileProof: params.proof,
  };
}

parentPort!.postMessage(
  genProofs(workerData.coeffs, workerData.chunks, workerData.commit),
);