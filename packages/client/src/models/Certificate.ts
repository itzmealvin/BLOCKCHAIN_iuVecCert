export interface Issuer {
  countryName: string;
  organizationName: string;
  commonName: string;
}

export interface Subject {
  commonName: string;
  organizationName: string;
  stateOrProvinceName: string;
  countryName: string;
  ID: string;
  role: string;
}

export interface ValidityPeriod {
  notBefore: Date;
  notAfter: Date;
}

export interface Certificate {
  clientCertificate: boolean;
  issuedBy: Issuer;
  issuedTo: Subject;
  validityPeriod: ValidityPeriod;
  pemCertificate: string;
}

export interface CertificateResult {
  reason?: Issuer[] | ValidityPeriod[];
  lastCert: Certificate;
  authenticity: boolean;
  expired: boolean;
  integrity: boolean;
  errorMsg?: string;
}
