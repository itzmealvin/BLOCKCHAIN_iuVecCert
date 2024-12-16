import { Contract } from "ethers";
import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";
import { PDFDocument } from "pdf-lib";
import { pdfjs } from "react-pdf";
import { CertificateResult } from "../models/Certificate.ts";

import {
  AppendixFileKeywords,
  CertFileKeywords,
  FileDetails,
  FileResult,
  Proof,
} from "../models/File.ts";
import { verifyPermission } from "./ConfigService.ts";

/**
 * Extract attachments from a certificate or appendix(s)
 * @param inputBuffer The PDF buffer to be extracted
 */
const extractAttachments = async (
  inputBuffer: Uint8Array
): Promise<Uint8Array[]> => {
  const pdfDoc = await pdfjs.getDocument({ data: inputBuffer }).promise;
  const attachments = await pdfDoc.getAttachments();

  if (!attachments) {
    throw new Error("No attachment(s) found in this PDF");
  }

  const hasConfig = !!attachments["SIGNED.pdf"];
  const hasCert = !!attachments["CERT.pdf"];
  const hasAppendix = !!attachments["APPENDIX.pdf"];

  if (!(hasConfig && hasCert) && !hasAppendix) {
    throw new Error(
      "Either both SIGNED.pdf and CERT.pdf must be present, or APPENDIX.pdf must be present alone"
    );
  }

  if (hasCert && hasConfig) {
    return [
      new Uint8Array(attachments["SIGNED.pdf"].content),
      new Uint8Array(attachments["CERT.pdf"].content),
    ];
  } else if (hasAppendix) {
    return [new Uint8Array(attachments["APPENDIX.pdf"].content)];
  } else {
    throw new Error("Failed to extract attachment(s) from this PDF");
  }
};

/**
 * Calculate the hash string in hex from a PDF file with random salt
 * @param certID The certificate ID to be calculated
 * @param type The type of this PDF file
 * @param bufferContent The buffer of this PDF file
 * @param salt The random 16 bytes salt of this PDF file
 */
const getHash = (
  certID: string,
  type: string,
  bufferContent: Uint8Array,
  salt: string
): string => {
  const contentWithSalt = Buffer.concat([
    Buffer.from(certID, "utf-8"),
    Buffer.from(type, "utf-8"),
    bufferContent,
    Buffer.from(salt, "utf-8"),
  ]);
  return "0x" + createHash("sha224").update(contentWithSalt).digest("hex");
};

/**
 * Produce the proof object from an embedded file list
 * @param files The list of user input file(s)
 * @param mode The mode user chose to be processed
 */
export const getProofObject = async (
  files: FileList,
  mode: "VERIFY" | "REVOKE" | "SELECTIVE"
): Promise<FileResult> => {
  const result = {
    fileDetail: {
      permissionResult: {} as CertificateResult,
      permissionBuffer: new Uint8Array(),
      commitAddress: "",
      contractInstance: {} as Contract,
      certName: "",
      certHash: "",
      certBuffer: new Uint8Array(),
      certFileProof: {} as Proof,
      requiredAppendixNames: [],
      requiredAppendixHashes: [],
      appendixFiles: [],
      appendixHashes: [],
      appendixFileProofs: [],
      appendixBuffers: [],
    } as FileDetails,
    certKeywords: {} as CertFileKeywords,
  };

  let savedCertID = "";
  let savedSalt = "";

  for (const file of Array.from(files)) {
    if (file.name.split(".").length !== 3) {
      throw new Error("File name must has 3 components");
    }
    const bufferContent = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(bufferContent);
    const keywordField = pdfDoc.getKeywords();

    if (
      !keywordField ||
      !keywordField.startsWith("{") ||
      !keywordField.endsWith("}")
    ) {
      throw new Error(
        `File "${file.name}" is missing embedded certificate data`
      );
    }

    const attachments = await extractAttachments(Buffer.from(bufferContent));
    if (attachments.length === 2 && (mode === "VERIFY" || mode === "REVOKE")) {
      result.fileDetail.permissionResult = verifyPermission(attachments[0]);
      result.fileDetail.permissionBuffer = attachments[0];
    }

    const parsedObject = JSON.parse(keywordField);

    if (!parsedObject.mainComponent) {
      const appendixParsedObject = parsedObject as AppendixFileKeywords;
      result.fileDetail.appendixBuffers.push(attachments[0]);
      result.fileDetail.appendixFiles.push(file.name.split(".")[1]);
      result.fileDetail.appendixFileProofs.push(appendixParsedObject.truePoint);
    } else {
      const certParsedObject = parsedObject as CertFileKeywords;
      result.certKeywords = certParsedObject;
      savedCertID = certParsedObject.certID;
      savedSalt = certParsedObject.salt;
      result.fileDetail.commitAddress = certParsedObject.commitAddress;
      result.fileDetail.requiredAppendixNames = certParsedObject.appendixFiles;
      result.fileDetail.requiredAppendixHashes =
        certParsedObject.appendixHashes;
      result.fileDetail.certName = file.name;
      result.fileDetail.certHash = getHash(
        certParsedObject.certID,
        "R",
        attachments[1],
        certParsedObject.salt
      );
      result.fileDetail.certBuffer = attachments[1];
      const { truePoint } = certParsedObject;
      result.fileDetail.certFileProof = {
        ...truePoint,
        value: result.fileDetail.certHash,
      };
    }
  }
  result.fileDetail.appendixHashes = result.fileDetail.appendixBuffers.map(
    (buffer, index) => {
      return getHash(
        savedCertID,
        result.fileDetail.appendixFiles[index],
        buffer,
        savedSalt
      );
    }
  );
  result.fileDetail.appendixFileProofs.map((appendixFileProof, index) => {
    appendixFileProof.value = result.fileDetail.appendixHashes[index];
  });

  if (mode === "VERIFY") {
    const mismatchedNames = result.fileDetail.requiredAppendixNames.filter(
      (name) => !result.fileDetail.appendixFiles.includes(name)
    );
    const mismatchedHashes = result.fileDetail.requiredAppendixHashes.filter(
      (hash) => !result.fileDetail.appendixHashes.includes(hash)
    );
    const requiredLength = result.fileDetail.requiredAppendixNames.length;
    const foundLength = result.fileDetail.appendixFiles.length;

    if (mismatchedNames.length > 0 || mismatchedHashes.length > 0) {
      throw new Error(
        `Missing appendix(s) detected.\nRequired appendix names: ${
          mismatchedNames.join(", ") || "None"
        }`
      );
    }

    if (requiredLength !== foundLength) {
      throw new Error(
        `Not enough appendix(s) detected. Required: ${requiredLength}/ Found: ${foundLength}`
      );
    }
  }

  return result;
};
