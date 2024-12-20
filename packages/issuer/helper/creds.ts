import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";
import { cpus } from "node:os";
import ProgressBar from "ora-progress-bar";
import PLimit from "p-limit";
import { PDFDocument } from "pdf-lib";
import { getResolvedPDFJS } from "unpdf";
import {
  commit,
  evaluateAt,
  genCoefficients,
  genProof,
  genVerifierContractParams,
} from "../libs/kzg.ts";
import { oraSpinner } from "../libs/logger.ts";
import type { FileHashes } from "../models/File.ts";
import type { Proof, Vector } from "../models/Vector.ts";
import { chunkArray, genChallengeIndex } from "../workers/chunkWorker.ts";
import { runChunkWorker } from "../workers/wrapper.ts";

export const cores = cpus().length;
const limit = PLimit(cores * 2);
const { getDocument } = await getResolvedPDFJS();

/**
 * Check if a PDF credential has requirement attachments.
 * @param fileBuffer The PDF credential buffer to be checked
 */
const hasAttachments = async (fileBuffer: Uint8Array): Promise<boolean> => {
  const pdfDoc = await getDocument({ data: new Uint8Array(fileBuffer) })
    .promise;
  const attachments = await pdfDoc.getAttachments();
  return (
    !!attachments?.["SIGNED.pdf"] ||
    !!attachments?.["CRED.pdf"] ||
    !!attachments?.["APPENDIX.pdf"]
  );
};

/**
 * Check if a PDF credential has a proper keywordField and attachments exist, then extract its field value(s)
 * @param fileBuffer The PDF credential buffer to be checked
 * @param fields The PDF credential field(s) to be extracted value from
 */
export const detectProofObject = async (
  fileBuffer: Buffer,
  fields?: string[],
): Promise<[boolean, string]> => {
  const credDoc = await PDFDocument.load(fileBuffer);
  const keywordField = credDoc.getKeywords();
  const form = credDoc.getForm();
  const credID = fields
    ? fields
      .map((field) => {
        const textField = form.getTextField(field);
        return textField.getText();
      })
      .join("_")
    : "";
  const hasAttachmentsFlag = await hasAttachments(fileBuffer);

  return [
    Boolean(
      keywordField?.startsWith("{") &&
        keywordField?.endsWith("}") &&
        hasAttachmentsFlag,
    ),
    credID,
  ];
};

/**
 * Calculate the hash string in hex from a PDF file with random salt
 * @param credID The credential ID to be calculated
 * @param type The type of this PDF file
 * @param bufferContent The buffer of this PDF file
 * @param salt The random 16 bytes salt of this PDF file
 */
export const getHash = (
  credID: string,
  type: string,
  bufferContent: Buffer | Uint8Array,
  salt: string,
): string => {
  const contentWithSalt = Buffer.concat([
    Buffer.from(credID, "utf-8"),
    Buffer.from(type, "utf-8"),
    bufferContent,
    Buffer.from(salt, "utf-8"),
  ]);
  return "0x" + createHash("sha224").update(contentWithSalt).digest("hex");
};

/**
 * Build vector commitment scheme for the given hashes
 * @param hashValues The hash values to be built
 */
export const buildVectorCommitment = async (
  hashValues: FileHashes[],
): Promise<Vector> => {
  const resultVector: Vector = {} as Vector;
  const leafLayer: Proof[] = [];

  const startTime = performance.now();

  hashValues.forEach(({ credHash, appendixHashes }) => {
    leafLayer.push({
      proof: [],
      index: leafLayer.length.toString(),
      value: credHash,
    });

    appendixHashes.forEach((hash) => {
      leafLayer.push({
        proof: [],
        index: leafLayer.length.toString(),
        value: hash,
      });
    });
  });

  const values = leafLayer.flat().map((leaf) => BigInt(leaf.value));
  const coeffValues = genCoefficients(values);
  const commitValue = commit(coeffValues);
  const leafChunks: Proof[][] = chunkArray(leafLayer, cores * 2);

  const processedChunks: Proof[] = [];
  const progressBar = new ProgressBar(
    `PROCESSING: ${hashValues.length} values`,
    leafChunks.length,
  );
  const chunkPromises = leafChunks.map((leafChunk, index) =>
    limit(
      async () =>
        await runChunkWorker(coeffValues, commitValue, leafChunk)
          .then((result) => {
            processedChunks[index] = result;
            progressBar.progress();
          })
          .catch((error) => {
            progressBar.fail();
            throw new Error(error);
          }),
    )
  );
  await Promise.all(chunkPromises);

  const challengeIndex = genChallengeIndex(coeffValues, commitValue);
  const challengeValue = evaluateAt(coeffValues, challengeIndex);
  const challengeProof = genProof(coeffValues, challengeIndex);
  const challengeParams = genVerifierContractParams(
    commitValue,
    challengeProof,
    challengeIndex,
    challengeValue,
  );

  resultVector.leafs = processedChunks.flat();
  resultVector.challenge = challengeParams;

  const endTime = performance.now();
  oraSpinner.succeed(
    `BUILT: Vector commitment successfully in ${
      (endTime - startTime).toFixed(
        2,
      )
    } ms`,
  );

  return resultVector;
};
