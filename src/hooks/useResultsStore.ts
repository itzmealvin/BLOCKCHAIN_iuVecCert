import {mountStoreDevtool} from "simple-zustand-devtools";
import {create} from "zustand";
import {StringValues} from "../services/calculateServices";

interface ResultsStates {
    coeffs: { calculatedCoeffs: string[] };
    commit: { calculatedCommit: string[] };
    challenge?: {
        commitment: string[];
        proof: string[];
        index: string;
        value: string;
    };
}

interface ResultsActions {
    setCoeffsResult: (resultObj: StringValues) => void;
    setCommitResult: (resultObj: StringValues) => void;
    setChallengeResult: (resultObj: StringValues) => void;
    resetResults: () => void;
}

const initialState: ResultsStates = {
    coeffs: {calculatedCoeffs: []},
    commit: {calculatedCommit: []},
    challenge: {commitment: [], proof: [], index: "", value: ""},
};

const useResultsStore = create<ResultsStates & ResultsActions>((set) => ({
    ...initialState,
    setCoeffsResult: (resultObj) =>
        set((state) => ({
            coeffs: {
                ...state.coeffs,
                calculatedCoeffs: resultObj.values,
            },
        })),
    setCommitResult: (resultObj) =>
        set((state) => ({
            commit: {
                ...state.commit,
                calculatedCommit: resultObj.values,
            },
        })),
    setChallengeResult: (resultObj) =>
        set(() => ({
            challenge: resultObj.challenge,
        })),
    resetResults: () => set(initialState),
}));

if (process.env.NODE_ENV === "development") {
    mountStoreDevtool("Result Storage", useResultsStore);
}

export default useResultsStore;
