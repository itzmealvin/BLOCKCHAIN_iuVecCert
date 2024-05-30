import { mountStoreDevtool } from "simple-zustand-devtools";
import { create } from "zustand";
import { StringValues } from "../../services/calculateServices";

interface ResultsStates {
  coeffs: { calculatedCoeffs: string[]; commitHash: string };
}

interface ResultsActions {
  setCoeffsResult: (resultObj: StringValues) => void;
  setCommitHash: (hash: string) => void;
  resetResults: () => void;
}

const initialState: ResultsStates = {
  coeffs: { calculatedCoeffs: [], commitHash: "" },
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
  setCommitHash: (hash) =>
    set((state) => ({
      coeffs: {
        ...state.coeffs,
        commitHash: hash,
      },
    })),
  resetResults: () => set(initialState),
}));

if (process.env.NODE_ENV === "development") {
  mountStoreDevtool("Result Storage", useResultsStore);
}

export default useResultsStore;
