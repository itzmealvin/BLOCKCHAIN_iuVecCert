import { Buffer } from "node:buffer";
import VerifyPDFError from "./VerifyPDFError.js";
import { getSignatureMeta, preparePDF } from "./general.js";

const DEFAULT_BYTE_RANGE_PLACEHOLDER = "**********";

const getByteRange = (pdfBuffer) => {
  const byteRangeStrings = pdfBuffer
    .toString()
    .match(
      /\/ByteRange\s*\[{1}\s*(?:(?:\d*|\/\*{10})\s+){3}(?:\d+|\/\*{10}){1}\s*\]{1}/g,
    );
  if (!byteRangeStrings) {
    throw new VerifyPDFError(
      "Failed to locate ByteRange.",
      VerifyPDFError.TYPES.TYPE_PARSE,
    );
  }

  const byteRangePlaceholder = byteRangeStrings.find((s) =>
    s.includes(`/${DEFAULT_BYTE_RANGE_PLACEHOLDER}`)
  );
  const strByteRanges = byteRangeStrings.map((brs) =>
    brs.match(/[^[\s]*(?:\d|\/\*{10})/g)
  );

  const byteRanges = strByteRanges.map((n) => n.map(Number));

  return {
    byteRangePlaceholder,
    byteRanges,
  };
};

export const extractSignature = (pdf) => {
  const pdfBuffer = preparePDF(pdf);

  const { byteRanges } = getByteRange(pdfBuffer);
  const lastIndex = byteRanges.length - 1;
  const endOfByteRange = byteRanges[lastIndex][2] + byteRanges[lastIndex][3];

  if (pdfBuffer.length > endOfByteRange) {
    throw new VerifyPDFError(
      "Failed byte range verification.",
      VerifyPDFError.TYPES.TYPE_BYTE_RANGE,
    );
  }

  const signatureStr = [];
  const signedData = [];
  byteRanges.forEach((byteRange) => {
    signedData.push(
      Buffer.concat([
        pdfBuffer.slice(byteRange[0], byteRange[0] + byteRange[1]),
        pdfBuffer.slice(byteRange[2], byteRange[2] + byteRange[3]),
      ]),
    );

    const signatureHex = pdfBuffer
      .slice(byteRange[0] + byteRange[1] + 1, byteRange[2])
      .toString("latin1");
    signatureStr.push(Buffer.from(signatureHex, "hex").toString("latin1"));
  });

  const signatureMeta = signedData.map((sd) => getSignatureMeta(sd));

  return {
    byteRanges,
    signatureStr,
    signedData,
    signatureMeta,
  };
};
