import { mountStoreDevtool } from "simple-zustand-devtools";
import { create } from "zustand";
import { FileDetails, FileProps } from "../services/FilesServices";

interface FilesStates {
  filesProps: FileProps[];
  filesDetails: FileDetails[];
}

interface FilesActions {
  setFilesProps: (files: FileProps[]) => void;
  setFilesDetails: (filesBuffers: FileDetails[]) => void;
  resetFiles: () => void;
}

const initialState: FilesStates = {
  filesProps: [],
  filesDetails: [],
};

const useFilesStore = create<FilesStates & FilesActions>((set) => ({
  ...initialState,
  setFilesProps: (fileArray) => set(() => ({ filesProps: fileArray })),
  setFilesDetails: (propArray) => set(() => ({ filesDetails: propArray })),
  resetFiles: () => set(initialState),
}));

if (process.env.NODE_ENV === "development") {
  mountStoreDevtool("File Storage", useFilesStore);
}

export default useFilesStore;
