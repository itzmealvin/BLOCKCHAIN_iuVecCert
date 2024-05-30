import { useQuery } from "@tanstack/react-query";
import { CACHE_KEY_PROOF } from "../constants";
import proofService, { Proofs } from "../services/proofService";

const useProof = (currentProof: Proofs) => {
  return useQuery<Proofs, Error>({
    queryKey: [...CACHE_KEY_PROOF, currentProof],
    queryFn: () => proofService.post(currentProof),
  });
};

export default useProof;
