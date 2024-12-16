import forge from "node-forge";
import tls from "node:tls";
import rootCAs from "./rootCAs.json" with { type: "json" };

const getRootCAs = () => tls.rootCertificates || rootCAs;

export const verifyRootCert = (chainRootInForgeFormat) =>
  !!getRootCAs().find((rootCAInPem) => {
    try {
      const rootCAInForgeCert = forge.pki.certificateFromPem(rootCAInPem);
      return (
        forge.pki.certificateToPem(chainRootInForgeFormat) === rootCAInPem ||
        rootCAInForgeCert.issued(chainRootInForgeFormat)
      );
    } catch (_e) {
      return false;
    }
  });

export const verifyCaBundle = (certs) =>
  !!certs.find((cert, i) => certs[i + 1] && certs[i + 1].issued(cert));

export const isCertsExpired = (certs) =>
  !!certs.find(
    ({ validity: { notAfter, notBefore } }) =>
      notAfter.getTime() < Date.now() || notBefore.getTime() > Date.now(),
  );

export const authenticateSignature = (certs) =>
  verifyCaBundle(certs) && verifyRootCert(certs[certs.length - 1]);
