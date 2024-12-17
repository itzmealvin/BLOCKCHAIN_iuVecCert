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

export interface CredFileKeywords extends AppendixFileKeywords {
  salt: string;
  credID: string;
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
  credName: string;
  credHash: string;
  credBuffer: Uint8Array;
  credFileProof: Proof;
  appendixFiles: string[];
  appendixHashes: string[];
  appendixFileProofs: Proof[];
  appendixBuffers: Uint8Array[];
}

export interface FileResult {
  credKeywords: CredFileKeywords;
  fileDetail: FileDetails;
}
