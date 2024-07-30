import useConfigsStore from "../hooks/useConfigsStore";
import useResultsStore from "../hooks/useResultsStore";
import { useIssuerStore } from "../hooks/useStepsStores";
import useWeb3Store from "../hooks/useWeb3Store";
import useFilesStore from "../hooks/useFilesStore";

export const resetIssuerStores = () => {
  useConfigsStore.getState().resetConfig();
  useIssuerStore.getState().resetStep();
  useResultsStore.getState().resetResults();
  useWeb3Store.getState().resetAddress();
  useFilesStore.getState().resetFiles();
};