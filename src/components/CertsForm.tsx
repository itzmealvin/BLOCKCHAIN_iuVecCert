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
import CertCommitment from "../compiled";
import {JsonRpcProvider} from "ethers";

const schema = (mode: "CREATE" | "VERIFY") => {
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
    mode: "CREATE" | "VERIFY";
}

export interface SimplifiedObject {
    "commit Address": string;
    "file Hash": string[];
}

const CertsForm = ({mode}: Props) => {
    const {setFilesProps, setFilesDetails} = useFilesStore();
    const [metaObj, setMetaObj] = useState({} as MetaDataObj);
    const {setContractAddress, setIssuerAddress} = useWeb3Store();
    const {isDone: isIssuerDone, toggleDone: toggleIssuerDone} = useIssuerStore();
    const {isDone: isVerifierDone, toggleDone: toggleVerifierDone} = useVerifierStore();
    const {setConfigs} = useConfigsStore();
    const [success, setSuccess] = useState(false);
    const chosenSchema = schema(mode);
    const provider = new JsonRpcProvider("https://rpc.sepolia.org", "sepolia")
    type InputSchema = z.infer<typeof chosenSchema>;

    const {
        register,
        handleSubmit,
        formState: {errors},
        reset,
    } = useForm<InputSchema>({resolver: zodResolver(chosenSchema)});

    const extractData = (metadataObject: MetaDataObj): SimplifiedObject => {
        const {commitAddress, files} = metadataObject;
        const fileHash = files.map(file => file.fileHash);
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

    const onVerifySubmit = (data: InputSchema) => {
        const resultPromise: Promise<MetaDataObj> = FilesServices.getMetaObj(
            data.certificates[0],
        );
        toast.promise(resultPromise, {
            pending: "Metadata are being retrieved",
            success: "Retrieved metadata!",
            error: "Not a valid IU-VerCert proof file!",
        }).then(() => {
        });
        (async () => {
            try {
                const res = await resultPromise;
                setSuccess(true);
                setMetaObj(res);
                setConfigs(res.config);
                setFilesProps(res.files);
                setContractAddress(res.commitAddress);
                const contract = blockchainServices.getContract(res.commitAddress, CertCommitment.abi, provider);
                const issuerAddress = await contract!.issuer();
                setIssuerAddress(issuerAddress);
                reset();
                if (!isVerifierDone) toggleVerifierDone();
            } catch (error) {
                toast.error("An error occurred")
            }
        })();
    };

    return (
        <>
            {mode === "CREATE" ?
                <Heading as="h1" size="md">
                    Upload your certificate batch (minimum 2 required)!
                </Heading> :
                <Heading as="h1" size="md">
                    Upload your embedded certificate to verify/revoke it!
                </Heading>}
            <form
                onSubmit={handleSubmit((data) => {
                    mode === "CREATE" ? onCreateSubmit(data) : onVerifySubmit(data);
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
            {metaObj && success && (
                <CardInfo mode="VERIFY" dataObject={extractData(metaObj)}>File details</CardInfo>
            )}
        </>
    );
};

export default CertsForm;
