import {mountStoreDevtool} from "simple-zustand-devtools";
import {create} from "zustand";
import {Configs} from "../services/ConfigsServices";

interface ConfigsStates {
    configs?: Configs;
    issuerCN: string;
}

interface ConfigsActions {
    setConfigs: (file: Configs) => void;
    setIssuerCN: (issuerCN: string) => void;
    resetConfig: () => void;
}

const initialState: ConfigsStates = {configs: {} as Configs, issuerCN: ""};

const useConfigsStore = create<ConfigsStates & ConfigsActions>((set) => ({
    ...initialState,
    setConfigs: (file) =>
        set(() => ({
            configs: file,
        })),
    setIssuerCN: (CN) =>
        set(() => ({
            issuerCN: CN,
        })),
    resetConfig: () => set(initialState),
}));

if (process.env.NODE_ENV === "development") {
    mountStoreDevtool("Configs Storage", useConfigsStore);
}

export default useConfigsStore;
