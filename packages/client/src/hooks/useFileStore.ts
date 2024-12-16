import process from "node:process";
import { mountStoreDevtool } from "simple-zustand-devtools";
import { create } from "zustand";
import { FileResult } from "../models/File.ts";

interface FileState {
  fileResult: FileResult;
}

interface FileActions {
  setFileResult: (fileResult: FileResult) => void;
  resetFile: () => void;
}

const initialState: FileState = {
  fileResult: {} as FileResult,
};

const useFileStore = create<FileState & FileActions>((set) => ({
  ...initialState,
  setFileResult: (fileResult) => set({ fileResult }),
  resetFile: () => set(() => ({ ...initialState })),
}));

if (process.env.NODE_ENV !== "development") {
  mountStoreDevtool("File Storage", useFileStore);
}

export default useFileStore;
