import {Button, Heading} from "@chakra-ui/react";
import {useState} from "react";
import {toast} from "react-toastify";
import useProof from "../../hooks/useProof";

import fileDownload from "js-file-download";
import FilesServices, {MetaDataObj} from "../../services/FilesServices";
import {Proofs} from "../../services/proofService";
import useFilesStore from "../../hooks/useFilesStore";
import useConfigsStore from "../../hooks/useConfigsStore";
import {useIssuerStore} from "../../hooks/useStepsStores";
import useWeb3Store from "../../hooks/useWeb3Store";
import useResultsStore from "../../hooks/useResultsStore";
import {resetIssuerStores} from "../../services/resetStore";

const EmbedProof = () => {
    const {filesDetails, filesProps} = useFilesStore();
    const {coeffs, commit} = useResultsStore();
    const {configs} = useConfigsStore();
    const {contractAddress} = useWeb3Store();
    const {toggleDone} = useIssuerStore();
    const prepareProofObj: Proofs = {
        coeffs: coeffs.calculatedCoeffs,
        commit: commit.calculatedCommit,
        files: filesProps,
    };
    const {data: proofObj, error, isLoading} = useProof(prepareProofObj);
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
            resetIssuerStores();
        }
    };

    return (
        <>
            {proofObj ? <Heading as="h1" size="md">
                Distribute the embedded certificates to the students, that's the end of this process
            </Heading> : <Heading as="h1" size="md">
                Generating proof parameters for the given polynomials per each file!
            </Heading>}
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
