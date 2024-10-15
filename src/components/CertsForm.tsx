import {Button, FormControl, FormErrorMessage, FormLabel, Heading, HStack, Input} from "@chakra-ui/react";
import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {toast} from "react-toastify";
import {z} from "zod";
import FilesServices, {FileDetails, FileProps, MetaDataObj} from "../services/FilesServices";
import {useIssuerStore, useVerifierStore} from "../hooks/useStepsStores";
import useFilesStore from "../hooks/useFilesStore";
import blockchainServices from "../services/BlockchainServices";
import useConfigsStore from "../hooks/useConfigsStore";
import useWeb3Store from "../hooks/useWeb3Store";
import CardInfo from "./Elements/CardInfo";
import {useState} from "react";
import {CertCommitment} from "../compiled";
import {JsonRpcProvider} from "ethers";
import {resetIssuerStores, resetVerifierStores} from "../services/resetStore";

const schema = (mode: "CREATE" | "VERIFY" | "REVOKE") => {
    return z.object({
        certificates: z
            .instanceof(FileList)
            .refine(
                (file) => (mode === "CREATE" ? file?.length >= 2 : file?.length === 1),
                mode === "CREATE"
                    ? "At least 2 certificates are required!"
                    : "At most 1 certificate is allowed!",
            ),
    });
};

interface Props {
    mode: "CREATE" | "VERIFY" | "REVOKE";
}

export interface SimplifiedObject {
    "commit Address": string;
    "file Hash": string[];
    "file Index"?: number[];
}

const CertsForm = ({mode}: Props) => {
    const {setFilesProps, setFilesDetails} = useFilesStore();
    const [metaObj, setMetaObj] = useState({} as MetaDataObj);
    const {setContractAddress, setIssuerAddress} = useWeb3Store();
    const {isDone: isIssuerDone, toggleDone: toggleIssuerDone} = useIssuerStore();
    const {isDone: isVerifierDone, toggleDone: toggleVerifierDone, nextStep} = useVerifierStore();
    const {setConfigs} = useConfigsStore();
    const [success, setSuccess] = useState(false);
    const chosenSchema = schema(mode);
    const provider = new JsonRpcProvider("https://rpc.sepolia.org", "sepolia");
    type InputSchema = z.infer<typeof chosenSchema>;

    const {
        register,
        handleSubmit,
        formState: {errors},
        reset,
    } = useForm<InputSchema>({resolver: zodResolver(chosenSchema)});

    const extractData = (metadataObject: MetaDataObj, mode: "VERIFY" | "REVOKE"): SimplifiedObject => {
        const {commitAddress, files} = metadataObject;
        const fileHash = files.map(file => file.fileHash);

        if (mode === "VERIFY") {
            const fileIndex = files.map(file => file.fileIndex);
            return {
                "commit Address": commitAddress,
                "file Hash": fileHash,
                "file Index": fileIndex,
            };
        }
        return {
            "commit Address": commitAddress,
            "file Hash": fileHash
        };
    };

    const onCreateSubmit = async (data: InputSchema) => {
        const verifyResult = await FilesServices.hasKeywordField(data.certificates);
        if (verifyResult) {
            const resultPromises: [Promise<FileDetails[]>, Promise<FileProps[]>] = [
                FilesServices.generateFilesProps(data.certificates),
                FilesServices.hashFiles(data.certificates),
            ];
            toast
                .promise(Promise.all(resultPromises), {
                    pending: "Files are being processed",
                    success: "All files hashed!",
                    error: "An unknown error occurred!",
                })
                .then((res): void => {
                    const [detailsArray, propsArray] = res;
                    setFilesDetails(detailsArray);
                    setFilesProps(propsArray);
                    reset();
                    if (!isIssuerDone) toggleIssuerDone();
                })
                .catch((error): void => {
                    toast.error(error);
                    return;
                });
        } else {
            toast.error("Embedded certificate exists! Please check again");
        }
    };

    const onVerifySubmit = (data: InputSchema, mode: "VERIFY" | "REVOKE") => {
        const resultPromise: Promise<MetaDataObj> = FilesServices.getMetaObj(
            data.certificates[0],
        );
        toast.promise(resultPromise, {
            error: "Not a valid IU-VecCert proof file!",
        }).then(() => {
        });
        (async () => {
            try {
                const res = await resultPromise;
                const contract = blockchainServices.getContract(res.commitAddress, CertCommitment.abi, provider);
                if (contract) {
                    const issuerAddress = await contract.issuer();
                    const isRevoked = await contract.isRevoked(res.files[0].fileHash);
                    if (isRevoked) {
                        toast.error("This certificate has already been revoked!");
                        resetIssuerStores();
                        resetVerifierStores();
                        setMetaObj({} as MetaDataObj);
                        if (isVerifierDone) toggleVerifierDone();
                        return;
                    }
                    setIssuerAddress(issuerAddress);
                    setSuccess(true);
                    setMetaObj(res);
                    setFilesProps(res.files);
                    setContractAddress(res.commitAddress);
                    reset();
                    if (mode === "VERIFY") {
                        setConfigs(res.config);
                        if (!isVerifierDone) toggleVerifierDone();
                        setTimeout(() => {
                            nextStep();
                        }, 2000);
                    }
                }
            } catch (error) {
                toast.error("An error occurred!")
            }
        })();
    };

    return (
        <>
            <Heading as="h1" size="md">
                {mode === "CREATE" ? (
                    "Upload your certificate batch (minimum 2 required)!"
                ) : mode === "VERIFY" ? (
                    "Upload your embedded certificate to verify it!"
                ) : mode === "REVOKE" ? (
                    "Upload your embedded certificate to revoke it!"
                ) : null}
            </Heading>
            <form
                onSubmit={handleSubmit((data) => {
                    mode === "CREATE" ? onCreateSubmit(data) : onVerifySubmit(data, mode);
                })}
            >
                <HStack spacing={5}>
                    <FormControl isInvalid={!!errors.certificates}>
                        <FormLabel htmlFor="certificates">
                            {mode === "CREATE" ? "" : "Embedded"} Certificates:
                        </FormLabel>
                        <Input
                            {...register("certificates")}
                            id="certificates"
                            type="file"
                            accept=".pdf"
                            multiple={true}
                        />
                        <FormErrorMessage>{errors.certificates?.message}</FormErrorMessage>
                    </FormControl>
                    <Button colorScheme="blue" variant="solid" type="submit" marginTop={3}>
                        PROCESS
                    </Button>
                </HStack>
            </form>
            {Object.keys(metaObj).length > 0 && success && (mode === "VERIFY" || mode === "REVOKE") && (
                <CardInfo mode={mode} dataObject={extractData(metaObj, mode)}>File details</CardInfo>
            )}
        </>
    );
};

export default CertsForm;
