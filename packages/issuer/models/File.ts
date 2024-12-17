import type { Proof } from "./Vector.ts";

export interface OmitFileDetails {
  credID: string;
  salt: string;
  credFile: string;
  appendixFiles: string[];
}

export interface FileDetails extends OmitFileDetails {
  credBuffer: Uint8Array;
  appendixBuffers: Uint8Array[];
}

export interface FileHashes {
  credHash: string;
  appendixHashes: string[];
}

export interface FileLoader {
  fileHashes: FileHashes[];
  fileDetails: FileDetails[];
}

export interface FileKeywords {
  salt?: string;
  credID?: string;
  mainComponent: boolean;
  commitAddress?: string;
  appendixFiles?: string[];
  appendixHashes?: string[];
  truePoint: Proof;
}
