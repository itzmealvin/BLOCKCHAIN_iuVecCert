import {Button, FormControl, FormErrorMessage, FormLabel, Heading, HStack, Input} from "@chakra-ui/react";
import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {toast} from "react-toastify";
import {z} from "zod";
import ConfigsServices from "../services/ConfigsServices";
import CardInfo from "./Elements/CardInfo";
import {useIssuerStore} from "../hooks/useStepsStores";
import useConfigsStore from "../hooks/useConfigsStore";
import BlockchainServices, {useEthersSigner} from "../services/BlockchainServices";
import {useState} from "react";

const schema = z.object({
    configs: z.instanceof(FileList).refine((file) => file.length === 1, {
        message: "Only accept at most 1 configuration JSON file!",
    }),
});

type InputSchema = z.infer<typeof schema>;

const ConfigsForm = () => {
    const {configs, setConfigs, setIssuerCN} = useConfigsStore();
    const [success, setSuccess] = useState<boolean>(false);
    const signer = useEthersSigner();
    const {isDone, toggleDone} = useIssuerStore();

    const {
        register,
        handleSubmit,
        formState: {errors},
        reset,
    } = useForm<InputSchema>({resolver: zodResolver(schema)});

    const onSubmit = async (data: InputSchema) => {
        if (signer && await BlockchainServices.performSignIn(signer)) {
            const resultPromise = ConfigsServices.readConfigs(data.configs[0]);
            toast
                .promise(resultPromise, {
                    error: "Uploaded file does not have the required fields!",
                })
                .then((res) => {
                    setConfigs(res);
                    const cert = ConfigsServices.extractCertChain(res.certChain);
                    setIssuerCN(ConfigsServices.getField(cert, "CN"));
                    if (res.account === signer.address) {
                        toast.success(
                            "Verification completed! You may proceed to the next step!",
                        );
                        setSuccess(true);
                        reset();
                        toggleDone();
                    } else {
                        toast.error(
                            "Verification failed! Upload another valid configuration, and ensure the right account is connected!",
                        );
                        reset();
                    }
                })
                .catch(() => {
                    reset();
                });
        } else {
            toast.error("Signature not correct or signer not detected");
            reset();
        }
    };

    return (
        <>
            {!signer ? (
                <Heading as="h1" size="md">
                    Connect a wallet to begin verification!
                </Heading>
            ) : (
                <Heading as="h1" size="md">
                    Upload your given configuration permission file!
                </Heading>
            )}
            <form onSubmit={handleSubmit(onSubmit)}>
                <HStack spacing={5}>
                    <FormControl isInvalid={!!errors.configs}>
                        <FormLabel htmlFor="configs">Configuration:</FormLabel>
                        <Input
                            {...register("configs")}
                            id="configs"
                            type="file"
                            accept=".json"
                        />
                        <FormErrorMessage>
                            {errors.configs && errors.configs.message}
                        </FormErrorMessage>
                    </FormControl>
                    <Button
                        colorScheme="blue"
                        variant="solid"
                        type="submit"
                        marginTop={3}
                        isDisabled={isDone || !signer}
                    >
                        VERIFY
                    </Button>
                </HStack>
            </form>
            {success && configs && (
                <CardInfo dataObject={configs}>Configuration details</CardInfo>
            )}
        </>
    );
};

export default ConfigsForm;