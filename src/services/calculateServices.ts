import APIClient from "./apiClient";

import { FileProps } from "./FilesServices";

export interface StringValues {
  values: string[];
  challenge?: FileProps;
}

export const coefficientsService = new APIClient<StringValues>("/coefficients");
export const commitmentService = new APIClient<StringValues>("/commitment");
