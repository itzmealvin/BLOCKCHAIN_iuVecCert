import { Contract } from "ethers";
import { CertificateResult } from "./Certificate.ts";

export interface Proof {
  proof: string[];
  index: string;
  value: string;
  commitment: string[];
}

export interface AppendixFileKeywords {
  mainComponent: boolean;
  truePoint: Proof;
}

export interface CertFileKeywords extends AppendixFileKeywords {
  salt: string;
  certID: string;
  commitAddress: string;
  appendixFiles: string[];
  appendixHashes: string[];
}

export interface FileDetails {
  permissionBuffer: Uint8Array;
  permissionResult: CertificateResult;
  contractInstance: Contract;
  deployerAddress?: string;
  commitAddress: string;
  requiredAppendixNames: string[];
  requiredAppendixHashes: string[];
  certName: string;
  certHash: string;
  certBuffer: Uint8Array;
  certFileProof: Proof;
  appendixFiles: string[];
  appendixHashes: string[];
  appendixFileProofs: Proof[];
  appendixBuffers: Uint8Array[];
}

export interface FileResult {
  certKeywords: CertFileKeywords;
  fileDetail: FileDetails;
}
