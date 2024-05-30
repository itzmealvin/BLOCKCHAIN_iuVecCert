import { useQuery } from "@tanstack/react-query";
import { CACHE_KEY_COEFFS, CACHE_KEY_COMMIT } from "../constants";
import {
  StringValues,
  coefficientsService,
  commitmentService,
} from "../services/calculateServices";

const useCoeffs = (hashes: StringValues) => {
  return useQuery<StringValues, Error>({
    queryKey: [...CACHE_KEY_COEFFS, hashes],
    queryFn: () => coefficientsService.post(hashes),
  });
};

const useCommit = (coeffs: StringValues) => {
  return useQuery<StringValues, Error>({
    queryKey: [...CACHE_KEY_COMMIT, coeffs],
    queryFn: () => commitmentService.post(coeffs),
  });
};

export { useCoeffs, useCommit };
