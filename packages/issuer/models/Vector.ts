export interface Proof {
  proof: string[];
  index: string;
  value: string;
}

export interface Challenge extends Proof {
  commitment: string[];
}

export interface Vector {
  challenge: Challenge;
  leafs: Proof[];
}

export interface ChallengeParams {
  index: string;
  value: string;
  proof: {
    X: string;
    Y: string;
  };
  commitment: {
    X: string;
    Y: string;
  };
}
