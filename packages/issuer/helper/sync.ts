import JSZip from "jszip";
import { Buffer } from "node:buffer";
import { randomBytes } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import ProgressBar from "ora-progress-bar";
import { PDFDocument } from "pdf-lib";
import { oraSpinner, waitForUserDecision } from "../libs/logger.ts";
import type {
  FileDetails,
  FileHashes,
  FileKeywords,
  FileLoader,
} from "../models/File.ts";
import type {
  DeploymentReceipt,
  SavedVectorCommitmentData,
} from "../models/VCDR.ts";
import type { Vector } from "../models/Vector.ts";
import { calculateContractAddress } from "./contract.ts";
import { cores, detectProofObject, getHash } from "./creds.ts";

const concurrencyLimit = Math.max(1, cores * 5);

/**
 * Group related files by their prefix
 * @param fileNames The file names to be grouped
 */
const groupFilesByPrefix = (fileNames: string[]): Record<string, string[]> => {
  return fileNames.reduce<Record<string, string[]>>((acc, file) => {
    const match = file.match(/^([^.]+)\./);
    if (match) {
      const prefix = match[1];
      acc[prefix] = acc[prefix] || [];
      acc[prefix].push(file);
    }
    return acc;
  }, {});
};

/**
 * Process each grouped files
 * @param credFiles The PDF credential file name(s) to be processed
 * @param credFolderPath The PDF credential root folder
 * @param fields The PDF credential field(s) to be extracted value from
 */
const processGroup = async (
  credFiles: string[],
  credFolderPath: string,
  fields: string[],
): Promise<{ hashes: FileHashes; details: FileDetails }> => {
  const credFile = credFiles.find((file) => {
    return file.includes("(R)") && file.split(".").length === 3;
  });

  if (!credFile) {
    throw new Error(
      "No required credential file detected with three components!",
    );
  }

  const credBuffer = readFileSync(join(credFolderPath, credFile));

  const appendixFiles = credFiles.filter(
    (file) =>
      !file.includes("(R)") &&
      file.match(/\.([^.]+)\.pdf$/) &&
      file.split(".").length === 3,
  );
  const appendixBuffers = appendixFiles.map((file) =>
    readFileSync(join(credFolderPath, file))
  );

  const [hasCertProof, credID] = await detectProofObject(credBuffer, fields);
  const hasAppendixProof = await Promise.any(
    appendixBuffers.map(async (buffer) => {
      const [hasProof] = await detectProofObject(buffer);
      return hasProof;
    }),
  );

  if (hasCertProof || hasAppendixProof) {
    throw new Error("This directory contains an IUVecCert embedded credential");
  }

  const salt = randomBytes(16).toString("hex");
  const credHash = getHash(credID, "R", credBuffer, salt);
  const appendixHashes = appendixFiles.map((appendixFile, i) =>
    getHash(credID, appendixFile.split(".")[1], appendixBuffers[i], salt)
  );

  return {
    hashes: {
      credHash,
      appendixHashes,
    },
    details: {
      credID,
      salt,
      credFile,
      credBuffer,
      appendixFiles,
      appendixBuffers,
    },
  };
};

/**
 * Load the credential folder and pre-process the file(s)
 * @param credFolderPath The PDF credential root folder to be loaded
 * @param fields The PDF credential field(s) to be extracted value from
 * @param index The slicing index to signal the number of PDF credential to be processed
 */
export const loadCertFolder = async (
  credFolderPath: string,
  fields: string[],
  index?: number,
): Promise<FileLoader> => {
  const files = readdirSync(credFolderPath).sort(
    new Intl.Collator(undefined, { numeric: true, sensitivity: "base" })
      .compare,
  );

  const groupedFiles = groupFilesByPrefix(files);
  const fileHashes: FileLoader["fileHashes"] = [];
  const fileDetails: FileLoader["fileDetails"] = [];
  const progressBar = new ProgressBar(
    `READING: PDF credential(s) from directory ${credFolderPath} as group`,
    index || Object.keys(groupedFiles).length,
  );

  await Promise.all(
    Object.entries(groupedFiles)
      .slice(0, index || Object.keys(groupedFiles).length)
      .map(async ([_, credFiles]) => {
        const result = await processGroup(credFiles, credFolderPath, fields);
        if (result) {
          fileHashes.push(result.hashes);
          fileDetails.push(result.details);
        }
        progressBar.progress();
      }),
  );

  if (fileDetails.length < 2) {
    progressBar.fail();
    throw new Error(
      "Detected fewer than 2 credential groups, which is insufficient for issuance",
    );
  }

  return { fileHashes, fileDetails };
};

/**
 * Format the current Date object to YYYY-MM-DD{T}HH:mm:ss{GMT+XX:XX}
 * @param specificDate The Date object to be formatted
 */
export const formatToday = (specificDate: Date) => {
  const timezoneOffset = -specificDate.getTimezoneOffset();
  const offsetHours = String(
    Math.floor(Math.abs(timezoneOffset) / 60),
  ).padStart(2, "0");
  const offsetMinutes = String(Math.abs(timezoneOffset) % 60).padStart(2, "0");
  const offsetSign = timezoneOffset >= 0 ? "+" : "-";
  const timezoneFormatted = `GMT${offsetSign}${offsetHours}:${offsetMinutes}`;
  const year = specificDate.getFullYear();
  const month = String(specificDate.getMonth() + 1).padStart(2, "0");
  const day = String(specificDate.getDate()).padStart(2, "0");
  const hours = String(specificDate.getHours()).padStart(2, "0");
  const minutes = String(specificDate.getMinutes()).padStart(2, "0");
  const seconds = String(specificDate.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${timezoneFormatted}`;
};

/**
 * Save the JSON object as a binary file
 * @param jsonObj The JSON object to be saved
 * @param fileName The file name for the JSON object
 */
export const saveJsonAsBin = (jsonObj: object, fileName: string) => {
  const jsonString = JSON.stringify(jsonObj);
  const base64Data = Buffer.from(jsonString, "utf-8").toString("base64");
  writeFileSync(fileName, base64Data);
};

/**
 * Read the binary file as a JSON object
 * @param fileName The file name for the JSON object to be read
 */
export const readBinAsJson = (fileName: string) => {
  const base64Data = readFileSync(fileName, "utf-8");
  const jsonString = Buffer.from(base64Data, "base64").toString("utf-8");
  return JSON.parse(jsonString);
};

/**
 * Validate the given deployment receipt
 * @param receipt The deployment receipt to be verified
 * @param grantedAddress The granted address from the PDF permission
 */
export const validateDeployment = async (
  receipt: DeploymentReceipt,
  grantedAddress: string,
) => {
  oraSpinner.start("VALIDATING: Retrieving response deployment receipt");
  const currentDate = new Date();
  const invalidFields: string[] = [];

  const results = {
    from: `${receipt.from} => ${
      receipt.from === grantedAddress
        ? "VALID"
        : (invalidFields.push("senderAddress"), "INVALID")
    }`,
    nonce: `${receipt.nonce} => USER DECISION NEED?`,
    blockNumber: `${receipt.blockNumber} => USER DECISION NEED?`,
    blockTimestamp: `${receipt.blockTimestamp} => ${
      (() => {
        const blockDate = new Date(receipt.blockTimestamp);
        if (blockDate > currentDate) {
          invalidFields.push("timestamp");
          return "INVALID";
        }

        const diffMs = Math.abs(blockDate.getTime() - currentDate.getTime());
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
        const diffMinutes = Math.floor((diffMs / (1000 * 60)) % 60);

        return `USER DECISION NEED? Deployed ${diffDays} days, ${diffHours} hours, ${diffMinutes} minutes ago`;
      })()
    }`,
    status: `${receipt.status} => ${
      receipt.status === 1 ? "VALID" : (invalidFields.push("status"), "INVALID")
    }`,
    confirmations: `${receipt.confirmations} => ${
      receipt.confirmations >= 1
        ? "VALID"
        : (invalidFields.push("confirmations"), "INVALID")
    }`,
    contractAddress: `${receipt.contractAddress} => ${
      calculateContractAddress(receipt.from, receipt.nonce) ===
          receipt.contractAddress
        ? "VALID"
        : (invalidFields.push("contractAddress"), "INVALID")
    }`,
  };
  if (invalidFields.length > 0) {
    throw new Error(
      `Some validation check(s) didn't pass: ${invalidFields.join(", ")}`,
    );
  }
  oraSpinner.warn(
    "VALIDATING: Retrieved response deployment receipt, but some field need user confirmation",
  );
  console.log(results);
  await waitForUserDecision();
};

/**
 * Reload credential folder from a Saved Vector Commitment Data (SVCD)
 * @param svcd The SVCD to be processed from
 */
export const loadCertFolderFromSVCD = (
  svcd: SavedVectorCommitmentData,
): FileDetails[] => {
  return svcd.details.map((detail) => {
    const credBuffer = readFileSync(join(svcd.credDir, detail.credFile));

    const appendixBuffers = detail.appendixFiles.map((file) =>
      readFileSync(join(svcd.credDir, file))
    );

    return {
      ...detail,
      credBuffer,
      appendixBuffers,
    };
  });
};

/**
 * Get the corresponding proof by specified index
 * @param index The index of the leaf to be retrieved
 * @param vectorData The vector data of this leaf
 */
const getProofByIndex = (
  index: number,
  vectorData: Vector,
): string[] | undefined => {
  return vectorData.leafs
    .find((leaf) => parseInt(leaf.index, 16) === index)
    ?.proof.slice(0, -1);
};

/**
 * Perform zipping and embedding the data to form PDFs
 * @param vectorData The full vector commitment data to be embedded
 * @param details The CertCommitment contract description detail
 * @param permission The PDF permission buffer to be attached
 * @param contractAddress The CertCommitment contract address
 */
export const zipAndEmbed = async (
  vectorData: Vector,
  details: FileDetails[],
  permission: Buffer,
  contractAddress: string,
) => {
  const zipper = new JSZip();
  const progressBar = new ProgressBar(
    `ZIPPING: ${details.length} embedded PDF credential groups`,
    details.length,
  );

  try {
    const embedTask = async (detail: FileDetails, index: number) => {
      const credDoc = await PDFDocument.load(detail.credBuffer);
      const trueCertProof = getProofByIndex(index, vectorData);

      if (trueCertProof) {
        const proof: FileKeywords = {
          salt: detail.salt,
          credID: detail.credID,
          mainComponent: true,
          commitAddress: contractAddress,
          appendixFiles: detail.appendixFiles.map((appendixName) => {
            const parts = appendixName.split(".");
            return parts[parts.length - 2];
          }),
          appendixHashes: detail.appendixFiles.map((appendixFile, i) =>
            getHash(
              detail.credID,
              appendixFile.split(".")[1],
              detail.appendixBuffers[i],
              detail.salt,
            )
          ),
          truePoint: {
            index: `0x${index.toString(16)}`,
            value: "",
            proof: trueCertProof,
          },
        };
        const keywords = [JSON.stringify(proof)];
        await credDoc.attach(permission, "SIGNED.pdf");
        await credDoc.attach(detail.credBuffer, "CERT.pdf");
        credDoc.setKeywords(keywords);
        const pdfBytes = await credDoc.save();
        zipper.file(`EMBEDDED_${detail.credFile}`, pdfBytes);
      }

      for (let i = 0; i < detail.appendixBuffers.length; i++) {
        const appendixBuffer = detail.appendixBuffers[i];
        const appendixFile = detail.appendixFiles[i];
        const appendixDoc = await PDFDocument.load(appendixBuffer);
        const trueAppendixProof = getProofByIndex(index + 1, vectorData);
        if (trueAppendixProof) {
          const proof: FileKeywords = {
            mainComponent: false,
            truePoint: {
              index: `0x${(index + 1).toString(16)}`,
              value: "",
              proof: trueAppendixProof,
            },
          };

          const keywords = [JSON.stringify(proof)];
          await appendixDoc.attach(appendixBuffer, "APPENDIX.pdf");
          appendixDoc.setKeywords(keywords);
          const pdfBytes = await appendixDoc.save();
          zipper.file(`EMBEDDED_${appendixFile}`, pdfBytes);
        }
      }
      progressBar.progress();
    };

    for (let i = 0; i < details.length; i += concurrencyLimit) {
      const batch = details.slice(i, i + concurrencyLimit);
      await Promise.all(
        batch.map((detail, index) => embedTask(detail, i + index)),
      );
    }

    return await zipper.generateAsync({ type: "nodebuffer" });
  } catch (error) {
    progressBar.fail();
    throw error;
  }
};
