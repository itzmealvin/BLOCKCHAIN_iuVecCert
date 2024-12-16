import type { Proof } from "./Vector.ts";

export interface OmitFileDetails {
  certID: string;
  salt: string;
  certFile: string;
  appendixFiles: string[];
}

export interface FileDetails extends OmitFileDetails {
  certBuffer: Uint8Array;
  appendixBuffers: Uint8Array[];
}

export interface FileHashes {
  certHash: string;
  appendixHashes: string[];
}

export interface FileLoader {
  fileHashes: FileHashes[];
  fileDetails: FileDetails[];
}

export interface FileKeywords {
  salt?: string;
  certID?: string;
  mainComponent: boolean;
  commitAddress?: string;
  appendixFiles?: string[];
  appendixHashes?: string[];
  truePoint: Proof;
}
