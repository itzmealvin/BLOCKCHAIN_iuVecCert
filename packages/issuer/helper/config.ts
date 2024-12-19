import { isAddress } from "ethers";
import { Buffer } from "node:buffer";
import { getResolvedPDFJS } from "unpdf";
import { oraSpinner, waitForUserDecision } from "../libs/logger.ts";
import { getCertificatesInfoFromPDF } from "../libs/pdf-verify/certificateDetails.js";
import { verifyPDF } from "../libs/pdf-verify/verifyPDF.js";
import type { Certificate } from "../models/Certificate.ts";

const { getDocument } = await getResolvedPDFJS();

/**
 * Verify the digital signature and extract subject common name, organization name field from a signed PDF
 * @param fileBuffer The signed PDF buffer to be checked
 */
export const verifyPermission = async (
  fileBuffer: Buffer,
): Promise<string[]> => {
  const { authenticity, expired, integrity } = verifyPDF(fileBuffer);

  const certs = getCertificatesInfoFromPDF(fileBuffer).flat() as Certificate[];
  const lastCert = certs[certs.length - 1] as Certificate;
  const issuerCN = Buffer.from(lastCert.issuedTo.commonName, "binary").toString(
    "utf-8",
  );
  const issuerOG = Buffer.from(
    lastCert.issuedTo.organizationName,
    "binary",
  ).toString("utf-8");

  if (!authenticity || expired || !integrity) {
    oraSpinner.fail("CHECKED: Some check(s) didn't pass");
    if (!authenticity) {
      oraSpinner.warn(
        "This certificate chain was issued by an authority that is not trusted",
      );
      console.log(
        certs.map((cert) => {
          return Object.fromEntries(
            Object.entries(cert.issuedBy).map(([key, value]) => [
              key,
              Buffer.from(value, "binary").toString("utf-8"),
            ]),
          );
        }),
      );
    }
    if (expired) {
      oraSpinner.warn("This certificate is expired");
      console.log(
        certs.filter((cert) => {
          const { notBefore, notAfter } = cert.validityPeriod;
          if (!(notBefore instanceof Date) || isNaN(notBefore.getTime())) {
            return true;
          }
          if (!(notAfter instanceof Date) || isNaN(notAfter.getTime())) {
            return true;
          }
          const now = new Date();
          return now < notBefore || now > notAfter;
        }),
      );
    }
    if (!integrity) {
      oraSpinner.fail("This certificate was modified");
    }
    const continueAction = await waitForUserDecision();

    if (!continueAction) {
      throw new Error("Operation aborted by the user");
    }
  }
  return [issuerCN, issuerOG];
};

/**
 * Extract the issuer address inside a PDF permission
 * @param fileBuffer The PDF permission buffer to be extracted
 */
export const extractAddress = async (
  fileBuffer: Buffer,
): Promise<string | undefined> => {
  const loadingTask = getDocument({ data: new Uint8Array(fileBuffer) });
  const pdfDocument = await loadingTask.promise;

  let fullText = "";

  for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
    const page = await pdfDocument.getPage(pageNum);
    const textContent = await page.getTextContent();
    fullText += textContent.items
      .map((item) => ("str" in item ? item.str : ""))
      .join("") + "\n";
  }

  const addressRegex = /0x[a-fA-F0-9]{40}/g;
  const matches = fullText.match(addressRegex);

  if (matches) {
    for (const address of matches) {
      if (isAddress(address)) {
        return address;
      }
    }
  } else {
    return undefined;
  }
};
