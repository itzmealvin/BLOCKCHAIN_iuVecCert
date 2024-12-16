import forge from "node-forge";
import { extractSignature } from "./extractSignature.js";
import { getMessageFromSignature, preparePDF } from "./general.js";

const mapEntityAttributes = (attrs) =>
  attrs.reduce((agg, { name, value }) => {
    if (!name) return agg;
    agg[name] = value;
    return agg;
  }, {});

const extractSingleCertificateDetails = (cert) => {
  const { issuer, subject, validity } = cert;
  return {
    issuedBy: mapEntityAttributes(issuer.attributes),
    issuedTo: mapEntityAttributes(subject.attributes),
    validityPeriod: validity,
    pemCertificate: forge.pki.certificateToPem(cert),
  };
};

export const extractCertificatesDetails = (certs) =>
  certs.map(extractSingleCertificateDetails).map((cert, i) => {
    if (i) return cert;
    return {
      clientCertificate: true,
      ...cert,
    };
  });

export const getCertificatesInfoFromPDF = (pdf) => {
  const pdfBuffer = preparePDF(pdf);
  const { signatureStr } = extractSignature(pdfBuffer);

  return signatureStr.map((signature) => {
    const newLocal = getMessageFromSignature(signature);
    const { certificates } = newLocal;
    return extractCertificatesDetails(certificates);
  });
};
