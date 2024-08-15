import {mountStoreDevtool} from "simple-zustand-devtools";
import {create} from "zustand";

interface Web3AuthStates {
    issuerAddress: string;
    contractAddress: string;
}

interface Web3AuthActions {
    setIssuerAddress: (address: string) => void;
    setContractAddress: (address: string) => void;
    resetAddress: () => void;
}

const initialState: Web3AuthStates = {
    issuerAddress: "",
    contractAddress: "",
};

const useWeb3Store = create<Web3AuthStates & Web3AuthActions>((set) => ({
    ...initialState,
    setIssuerAddress: (address) => set(() => ({issuerAddress: address})),
    setContractAddress: (address) => set(() => ({contractAddress: address})),
    resetAddress: () => set(initialState),
}));

if (process.env.NODE_ENV === "development") {
    mountStoreDevtool("Web3Auth Storage", useWeb3Store);
}

export default useWeb3Store;
