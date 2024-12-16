interface Issuer {
  countryName: string;
  organizationName: string;
  commonName: string;
}

interface Subject {
  commonName: string;
  organizationName: string;
  stateOrProvinceName: string;
  countryName: string;
}

interface ValidityPeriod {
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
