export interface Proof {
  proof: string[];
  index: string;
  value: string;
  commitment?: string[];
}

export interface Vector {
  challenge: Proof;
  leafs: Proof[];
}

export interface ChallengeParams {
  index: string;
  value: string;
  proof: {
    X: string;
    Y: string;
  };
  commitment?: {
    X: string;
    Y: string;
  };
}
