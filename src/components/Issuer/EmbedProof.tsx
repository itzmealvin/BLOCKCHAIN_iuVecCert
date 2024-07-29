import { Button, Heading } from "@chakra-ui/react";
import { useState } from "react";
import { toast } from "react-toastify";
import useProof from "../../hooks/useProof";

import fileDownload from "js-file-download";
import FilesServices, { MetaDataObj } from "../../services/FilesServices";
import { Proofs } from "../../services/proofService";
import useFilesStore from "../CertsForm/useFilesStore";
import useConfigsStore from "../ConfigsForm/useConfigsStore";
import { useIssuerStore } from "../StepsIndicator/useStepsStores";
import useWeb3AuthStore from "../Web3Auth/useWeb3AuthStore";
import useResultsStore from "./useResultsStore";

const EmbedProof = () => {
  const { filesDetails, filesProps } = useFilesStore();
  const { coeffs, commit } = useResultsStore();
  const { configs } = useConfigsStore();
  const { contractAddress } = useWeb3AuthStore();
  const { toggleDone } = useIssuerStore();
  const prepareProofObj: Proofs = {
    coeffs: coeffs.calculatedCoeffs,
    commit: commit.calculatedCommit,
    files: filesProps,
  };
  const { data: proofObj, error, isLoading } = useProof(prepareProofObj);
  const [disabled, setDisabled] = useState(true);
  error ? toast.error(error.message) : null;

  const handleClick = () => {
    if (proofObj) {
      const metaObj: MetaDataObj = {
        ...proofObj,
        commitAddress: contractAddress,
        config: configs!,
      };
      const promiseResult = FilesServices.embedAndZip(filesDetails, metaObj);
      toast
        .promise(promiseResult, {
          pending: "Certificate are being embedded and zipped",
          success: "All Certificate embedded, downloading zipped file!",
          error: "An unknown error occurred!",
        })
        .then((res) => {
          fileDownload(res, `${contractAddress}_embedded.zip`);
        });
      setDisabled(!disabled);
      toggleDone();
    }
  };

  return (
    <>
      <Heading as="h1" size="md">
        Distribute the embedded certificates to the students, that's the end of this process
      </Heading>
      <Button
        colorScheme="blue"
        variant="solid"
        onClick={handleClick}
        isLoading={isLoading}
        isDisabled={!disabled}
      >
        DOWNLOAD
      </Button>
    </>
  );
};

export default EmbedProof;
