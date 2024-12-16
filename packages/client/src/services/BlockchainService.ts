import {
  Contract,
  ethers,
  InterfaceAbi,
  JsonRpcProvider,
  JsonRpcSigner,
} from "ethers";

export const provider = new JsonRpcProvider(
  "https://eth-sepolia.public.blastapi.io",
  "sepolia",
);

/**
 * Get the contract instance to be called later
 * @param address The address of this contract
 * @param abi The abi bytecode of this contract
 * @param signerOrProvider The signer/provider to interact with this contract
 */
export const getContractInstance = (
  address: string,
  abi: InterfaceAbi,
  signerOrProvider: JsonRpcSigner | JsonRpcProvider,
): Contract => {
  return new Contract(
    address,
    abi,
    signerOrProvider || ethers.getDefaultProvider(),
  );
};

/**
 * Decode the Challenge for easy verify using smart contracts
 * @param challengeObj The formatted challenge to be decoded
 */
export const decodeChallenge = (challengeObj: { [s: string]: bigint }) => {
  return {
    index: `0x${challengeObj["0"].toString(16)}`,
    value: `0x${challengeObj["1"].toString(16)}`,
    proof: [
      `0x${challengeObj["2"].toString(16)}`,
      `0x${challengeObj["3"].toString(16)}`,
    ],
    commitment: [
      `0x${challengeObj["4"].toString(16)}`,
      `0x${challengeObj["5"].toString(16)}`,
    ],
  };
};
