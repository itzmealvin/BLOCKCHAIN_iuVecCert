import { Buffer } from "node:buffer";
import { pdfjs } from "react-pdf";
import {
  Certificate,
  CertificateResult,
  Issuer,
  ValidityPeriod,
} from "../models/Certificate.ts";
/**
 * @ts-expect-error: Pure JavaScript library without declaration file
 */
import { getCertificatesInfoFromPDF } from "./pdf-verify/certificateDetails.js";
/**
 * @ts-expect-error: Pure JavaScript library without declaration file
 */
import { verifyPDF } from "./pdf-verify/verifyPDF.js";

/**
 * Verify the digital signature and extract information from a signed PDF
 * @param fileBuffer The signed PDF buffer to be checked
 */
export const verifyPermission = (fileBuffer: Uint8Array): CertificateResult => {
  let errorMsg;
  let reason;
  const { authenticity, expired, integrity } = verifyPDF(fileBuffer);

  const certs = getCertificatesInfoFromPDF(fileBuffer).flat() as Certificate[];
  const lastCert = certs[certs.length - 1] as Certificate;

  if (!authenticity || expired || !integrity) {
    if (!authenticity) {
      errorMsg =
        "This certificate chain was issued by an authority that is not trusted";
      reason = certs.map((cert) => {
        return Object.fromEntries(
          Object.entries(cert.issuedBy).map(([key, value]) => [
            key,
            renderAsUTF8(value),
          ]),
        );
      }) as unknown as Issuer[];
    }
    if (expired) {
      errorMsg = "This certificate is expired";
      reason = certs.filter((cert) => {
        const { notBefore, notAfter } = cert.validityPeriod;
        if (isNaN(notBefore.getTime())) {
          return true;
        }
        if (isNaN(notAfter.getTime())) {
          return true;
        }
        const now = new Date();
        return now < notBefore || now > notAfter;
      }) as unknown as ValidityPeriod[];
    }
    if (!integrity) {
      errorMsg = "This certificate was modified";
    }
  }
  return { reason, lastCert, authenticity, expired, integrity, errorMsg };
};

/**
 * Render the obfuscated string with UTF-8 encoding
 * @param value The string value to be rendered
 */
export const renderAsUTF8 = (value: string) => {
  return Buffer.from(value, "binary").toString("utf-8");
};

/**
 * Extract the issuer address inside a PDF permission
 * @param fileBuffer The PDF permission buffer to be looked up
 * @param address The address that need to be checked against
 */
export const addressLookup = async (
  fileBuffer: Uint8Array,
  address: string,
): Promise<boolean> => {
  const loadingTask = pdfjs.getDocument({ data: fileBuffer });
  const pdfDocument = await loadingTask.promise;

  let fullText = "";
  for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
    const page = await pdfDocument.getPage(pageNum);
    const textContent = await page.getTextContent();
    fullText += textContent.items
      .map((item) => ("str" in item ? item.str : ""))
      .join("") + "\n";
  }
  return new RegExp(address).test(fullText);
};
