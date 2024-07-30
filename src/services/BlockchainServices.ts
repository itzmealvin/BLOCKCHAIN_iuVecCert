import { BrowserProvider, ethers, InterfaceAbi, JsonRpcSigner, verifyMessage } from "ethers";
import { Account, Chain, Client, Transport } from "viem";
import { Config, useConnectorClient } from "wagmi";
import { useMemo } from "react";

export interface ContractDetails {
  abi: InterfaceAbi;
  address?: string;
}

export interface ContractProps extends ContractDetails {
  bytecode: string;
  parameters?: string[];
}

class BlockchainServices {
  constructor(private _networkID = "0xaa36a7") {
  }

  clientToSigner(client: Client<Transport, Chain, Account>) {
    const { account, chain, transport } = client;
    const network = {
      chainId: chain.id,
      name: chain.name,
      ensAddress: chain.contracts?.ensRegistry?.address,
    };
    const provider = new BrowserProvider(transport, network);
    return new JsonRpcSigner(provider, account.address);
  }

  async performSignIn(currentSigner: JsonRpcSigner, signInMsg?: string) {
    const currentAddress = currentSigner.address;
    const message = signInMsg || `I hereby confirm I am the owner of address ${currentAddress} to use IU-VerCert!\n\nChain ID: ${
      this._networkID
    }\n\nIssued At: ${new Date().toLocaleString()}.`;
    const sig = await currentSigner.signMessage(message);
    return verifyMessage(message, sig) === currentAddress;
  }

  async deployContract(
    deployer: JsonRpcSigner,
    contractDetails: ContractProps,
  ): Promise<{ hash: string; address: string }> {
    const { abi, bytecode, parameters } = contractDetails;
    const factory = new ethers.ContractFactory(abi, bytecode, deployer);
    let deployedContractInstance;
    parameters
      ? (deployedContractInstance = await factory.deploy(...parameters))
      : (deployedContractInstance = await factory.deploy());
    return {
      hash: deployedContractInstance.deploymentTransaction()!.hash,
      address: await deployedContractInstance.getAddress(),
    };
  }

  // getContract(
  //   contractDetails: ContractDetails,
  //   issuer?: ethers.Signer
  // ): ethers.Contract | undefined {
  //   const { abi, address } = contractDetails;
  //   if (address) {
  //     return new ethers.Contract(address, abi, issuer);
  //   }
  //   return undefined;
  // }
}

const blockchainServices = new BlockchainServices();
export default blockchainServices;

export function useEthersSigner({ chainId }: { chainId?: number } = {}) {
  const { data: client } = useConnectorClient<Config>({ chainId });
  return useMemo(() => (client ? blockchainServices.clientToSigner(client) : undefined), [client]);
}