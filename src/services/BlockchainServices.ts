import { BrowserProvider, InterfaceAbi, ethers } from "ethers";
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
  constructor(private _networkID = "0xaa36a7") {}

  getProvider(network?: "sepolia") {
    if (window.ethereum === null && network) {
      toast.error("MetaMask is not installed! Running as READ-ONLY mode.");
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
    const signInMsg = `I hereby confirm I am the owner of address ${currentAddress} and accept the ToS for IU-VerCert!\n\nChain ID: ${
      this._networkID
    }\n\nIssued At: ${new Date().toLocaleString()}.`;
    await wallet.send("personal_sign", [signInMsg, currentAddress]);
    return { signer: currentSigner, address: currentAddress };
  }

  async deployContract(
    deployer: ethers.Signer,
    contractDetails: ContractProps,
  ): Promise<string> {
    const { abi, bytecode, parameters } = contractDetails;
    const factory = new ethers.ContractFactory(abi, bytecode, deployer);
    let deployedContractInstance;
    parameters
      ? (deployedContractInstance = await factory.deploy(...parameters))
      : (deployedContractInstance = await factory.deploy());
    return deployedContractInstance.getAddress();
  }

  getContract(
    issuer: ethers.Signer,
    contractDetails: ContractDetails,
  ): ethers.Contract | undefined {
    const { abi, address } = contractDetails;
    if (address) {
      return new ethers.Contract(address, abi, issuer);
    }
    return;
  }

  // async revokeCert(
  //   hashValue: string,
  //   commitContract: ethers.Contract
  // ): Promise<void> {}
}

export default new BlockchainServices();
