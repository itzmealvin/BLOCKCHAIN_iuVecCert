import {mountStoreDevtool} from "simple-zustand-devtools";
import {create} from "zustand";

interface Web3AuthStates {
    contractAddress: string;

}

interface Web3AuthActions {
    setContractAddress: (address: string) => void;
    resetAddress: () => void;
}

const initialState: Web3AuthStates = {
    contractAddress: "",
};

const useWeb3Store = create<Web3AuthStates & Web3AuthActions>((set) => ({
    ...initialState,

    setContractAddress: (address) => set(() => ({contractAddress: address})),
    resetAddress: () => set(initialState),
}));

if (process.env.NODE_ENV === "development") {
    mountStoreDevtool("Web3Auth Storage", useWeb3Store);
}

export default useWeb3Store;
