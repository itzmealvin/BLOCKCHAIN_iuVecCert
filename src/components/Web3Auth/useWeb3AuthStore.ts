import { Signer } from "ethers";
import { mountStoreDevtool } from "simple-zustand-devtools";
import { create } from "zustand";

interface Web3AuthStates {
  connectedDeployer: Signer | null;
  connectedAddress: string;
  contractAddress: string;
  isSignedIn: boolean;
}

interface Web3AuthActions {
  setDeployer: (deployer: Signer) => void;
  setConnectedAddress: (address: string) => void;
  setContractAddress: (address: string) => void;
  signIn: () => void;
  logOut: () => void;
}

const initialState: Web3AuthStates = {
  connectedAddress: "",
  contractAddress: "",
  connectedDeployer: null,
  isSignedIn: false,
};

const useWeb3AuthStore = create<Web3AuthStates & Web3AuthActions>((set) => ({
  ...initialState,
  setDeployer: (deployer) => set(() => ({ connectedDeployer: deployer })),
  setConnectedAddress: (address) => set(() => ({ connectedAddress: address })),
  setContractAddress: (address) => set(() => ({ contractAddress: address })),
  signIn: () => set((state) => ({ isSignedIn: !state.isSignedIn })),
  logOut: () => set(() => initialState),
}));

if (process.env.NODE_ENV === "development") {
  mountStoreDevtool("Web3Auth Storage", useWeb3AuthStore);
}

export default useWeb3AuthStore;
