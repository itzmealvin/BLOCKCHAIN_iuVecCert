import APIClient from "./apiClient";

export interface StringValues {
  values: string[];
}

export const coefficientsService = new APIClient<StringValues>("/coefficients");
export const commitmentService = new APIClient<StringValues>("/commitment");
