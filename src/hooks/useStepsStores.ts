import { mountStoreDevtool } from "simple-zustand-devtools";
import { create } from "zustand";

export interface StepsDetails {
  title: string;
  description: string;
}

export const issuerSteps: StepsDetails[] = [
  { title: "Step 1", description: "Verify Configuration" },
  { title: "Step 2", description: "Upload Certificates" },
  { title: "Step 3", description: "Save Coefficients" },
  { title: "Step 4", description: "Deploy Commitment" },
  { title: "Step 5", description: "Embed Proof" },
];

export const verifierSteps: StepsDetails[] = [
  { title: "Step 1", description: "Upload Certificate" },
  { title: "Step 2", description: "Verify Validity" },
  { title: "Step 3", description: "Verify Organization" },
  { title: "Step 4", description: "Verify Coefficients" },
  { title: "Step 5", description: "Verify Certificate" },
];

interface StepsStates {
  isDone: boolean;
  maxStep?: number;
  currentStep: number;
}

interface StepsActions {
  nextStep: () => void;
  prevStep: () => void;
  toggleDone: () => void;
  resetStep: () => void;
}

const initialState: StepsStates = {
  isDone: false,
  currentStep: 0,
};

const createStore = (steps: StepsDetails[]) => {
  return create<StepsStates & StepsActions>((set) => ({
    ...initialState,
    maxStep: steps.length,
    nextStep: () =>
      set((state) => ({
        maxStep: steps.length,
        currentStep:
          state.currentStep < state.maxStep!
            ? state.currentStep + 1
            : state.currentStep,
        isDone: !state.isDone,
      })),
    prevStep: () =>
      set((state) => ({
        currentStep:
          state.currentStep > 0 ? state.currentStep - 1 : state.currentStep,
        isDone: !state.isDone,
      })),
    resetStep: () => {
      set(initialState);
    },
    toggleDone: () => {
      set((state) => ({
        isDone: !state.isDone,
      }));
    },
  }));
};

export const useIssuerStore = createStore(issuerSteps);
export const useVerifierStore = createStore(verifierSteps);

if (process.env.NODE_ENV === "development") {
  mountStoreDevtool("Issuer Steps Storage", useIssuerStore);
  mountStoreDevtool("Verifier Steps Storage", useVerifierStore);
}
