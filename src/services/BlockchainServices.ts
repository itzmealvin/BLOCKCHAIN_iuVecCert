import { BrowserProvider, ethers, InterfaceAbi } from "ethers";
import { toast } from "react-toastify";

export interface ContractDetails {
  abi: InterfaceAbi;
  address?: string;
}

export interface ContractProps extends ContractDetails {
  abi: InterfaceAbi;
  bytecode: string;
  parameters: string[];
}

class BlockchainServices {
  constructor(private _networkID = "0xaa36a7") {
  }

  getProvider(network?: "sepolia") {
    if (window.ethereum === null && network) {
      toast.error("MetaMask is not installed! Only VERIFY mode available.");
      return ethers.getDefaultProvider(network);
    } else {
      return new ethers.BrowserProvider(window.ethereum);
    }
  }

  async isOnRightNetwork(wallet: BrowserProvider): Promise<boolean> {
    const currentNetworkID = await wallet.send("eth_chainId", []);
    if (currentNetworkID !== this._networkID) {
      toast.warning("Please switch to the right network!");
      return false;
    }
    return true;
  }

  async switchNetwork(wallet: BrowserProvider) {
    wallet
      .send("wallet_switchEthereumChain", [{ chainId: this._networkID }])
      .catch(async (Error) => {
        if (Error.code === 4902) {
          await wallet.send("wallet_addEthereumChain", [
            {
              chainId: this._networkID,
              rpcUrls: ["https://ethereum-sepolia.publicnode.com"],
              chainName: "Sepolia",
              nativeCurrency: {
                name: "ETH",
                symbol: "ETH",
                decimals: 18,
              },
              blockExplorerUrls: ["https://sepolia.etherscan.io/"],
            },
          ]);
        }
      });
  }

  async performSignIn(wallet: BrowserProvider) {
    const currentSigner = await wallet.getSigner();
    const currentAddress = currentSigner.address;
    const signInMsg = `I hereby confirm I am the owner of address ${currentAddress} to use IU-VerCert!\n\nChain ID: ${
      this._networkID
    }\n\nIssued At: ${new Date().toLocaleString()}.`;
    await wallet.send("personal_sign", [signInMsg, currentAddress]);
    return { signer: currentSigner, address: currentAddress };
  }

  async deployContract(
    deployer: ethers.Signer,
    contractDetails: ContractProps,
  ): Promise<{ hash: string, address: string }> {
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

  getContract(
    contractDetails: ContractDetails,
    issuer?: ethers.Signer,
  ): ethers.Contract | undefined {
    const { abi, address } = contractDetails;
    if (address && issuer) {
      return new ethers.Contract(address, abi, issuer);
    } else if (address) {
      return new ethers.Contract(address, abi);
    }

  }

  // @TODO: Implement revoke cert contract call
  // async revokeCert(
  //   hashValue: string,
  //   commitContract: ethers.Contract
  // ): Promise<void> {}

  // @TODO: Implement verify challenge contract call
  // async verifyChallenge(
  //   commitContract: ethers.Contract
  // ): Promise<void> {}

  // @TODO: Implement verify cert contract call
  // async verifyCert(
  //  certParams: FileProps
  // ): Promise<boolean> {}
}

export default new BlockchainServices();
