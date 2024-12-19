import type { OmitFileDetails } from "./File.ts";
import type { ChallengeParams, Vector } from "./Vector.ts";

export interface SavedVectorCommitmentData {
  vectorData: Vector;
  details: OmitFileDetails[];
  credDir: string;
}

export interface VectorCommitmentDeploymentRequest {
  issuerCN: string;
  issuerOG: string;
  description: string;
  challenge: ChallengeParams;
  grantedAddress: string;
  numberOfCreds: number;
  lastModified: string;
  lastOperation: "built" | "deployed";
}

export interface DeploymentReceipt {
  from: string;
  nonce: number;
  blockNumber: number;
  blockTimestamp: string;
  status: number;
  confirmations: number;
  contractAddress: string;
}

export interface VectorCommitmentDeploymentResponse
  extends VectorCommitmentDeploymentRequest {
  deploymentReceipt: DeploymentReceipt;
}
