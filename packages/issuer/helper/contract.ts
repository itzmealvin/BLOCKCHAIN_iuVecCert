import type { Challenge } from "../models/Vector.ts";
import {
  dataSlice,
  encodeRlp,
  getAddress,
  keccak256,
} from "../static/ethers.min.js";

/**
 * Encode the GPoint to be uploaded to the smart contract
 * @param rawPoint The raw point format to be encoded
 */
const encodeGPoint = (rawPoint: string[] | bigint[]) => {
  return {
    X: BigInt(rawPoint[0]).toString(),
    Y: BigInt(rawPoint[1]).toString(),
  };
};

/**
 * Encode the Challenge to be uploaded to the smart contract
 * @param rawChallenge The raw challenge format to be encoded
 */
export const encodeChallenge = (rawChallenge: Challenge) => {
  return {
    index: BigInt(rawChallenge.index).toString(),
    value: BigInt(rawChallenge.value).toString(),
    proof: encodeGPoint(rawChallenge.proof.slice(0, 2)),
    commitment: rawChallenge.commitment &&
      encodeGPoint(rawChallenge.commitment.slice(0, 2)),
  };
};

/**
 * Calculate the correct contract address based on sender address and its nonce
 * @param from The sender address to be checked
 * @param nonce The current nonce of this address
 */
export const calculateContractAddress = (from: string, nonce: number) => {
  let nonceHex = nonce.toString(16);
  if (nonceHex === "0") {
    nonceHex = "0x";
  } else if (nonceHex.length % 2) {
    nonceHex = "0x0" + nonceHex;
  } else {
    nonceHex = "0x" + nonceHex;
  }
  return getAddress(dataSlice(keccak256(encodeRlp([from, nonceHex])), 12));
};
