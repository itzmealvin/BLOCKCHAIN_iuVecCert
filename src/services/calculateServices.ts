import APIClient from "./apiClient";

export interface StringValues {
  values: string[];
  challenge?: { commitment: string[]; proof: string[]; index: string; value: string };
}

export const coefficientsService = new APIClient<StringValues>("/coefficients");
export const commitmentService = new APIClient<StringValues>("/commitment");
