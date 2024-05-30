import APIClient from "./apiClient";
import { FileProps } from "./FilesServices";

export interface Proofs {
  coeffs?: string[];
  commit?: string[];
  files: FileProps[];
}

export default new APIClient<Proofs>("/proof");
