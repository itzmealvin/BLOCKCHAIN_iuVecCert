import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Heading,
  Input,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";
import ConfigsServices from "../../services/ConfigsServices";
import CardInfo from "../Elements/CardInfo";
import { useIssuerStore } from "../StepsIndicator/useStepsStores";
import useWeb3AuthStore from "../Web3Auth/useWeb3AuthStore";
import useConfigsStore from "./useConfigsStore";

const schema = z.object({
  configs: z.instanceof(FileList).refine((file) => file.length === 1, {
    message: "Only accept at most 1 configuration JSON file!",
  }),
});

type InputSchema = z.infer<typeof schema>;

const ConfigsForm = () => {
  const { configs, setConfigs, setIssuerCN } = useConfigsStore();
  const { connectedAddress } = useWeb3AuthStore();
  const { isDone, toggleDone } = useIssuerStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<InputSchema>({ resolver: zodResolver(schema) });

  const onSubmit = (data: InputSchema) => {
    const resultPromise = ConfigsServices.readConfigs(data.configs[0]);
    toast
      .promise(resultPromise, {
        pending: "Configurations are being processed",
        error: "Uploaded file does not have the required fields!",
      })
      .then((res) => {
        setConfigs(res);
        const cert = ConfigsServices.extractCertChain(res.certChain);
        setIssuerCN(ConfigsServices.getField(cert, "CN"));
        if (res.account === connectedAddress) {
          toast.success(
            "Verification completed! You may proceed to next step!",
          );
          reset();
          toggleDone();
        } else {
          toast.error(
            "Verification failed! Upload another valid configuration, and ensure the right account is connected!",
          );
          reset();
        }
      });
  };

  return (
    <>
      {!connectedAddress && (
        <Heading as="h1" size="md">
          Connect a wallet to begin verification!
        </Heading>
      )}
      <form
        onSubmit={handleSubmit((data) => {
          onSubmit(data);
        })}
      >
        <HStack spacing={5}>
          <FormControl isInvalid={!!errors.configs}>
            <FormLabel htmlFor="config">Configuration:</FormLabel>
            <Input
              {...register("configs")}
              id="certificates"
              type="file"
              accept=".json"
            />
            <FormErrorMessage>{!!errors.configs}</FormErrorMessage>
          </FormControl>
          <Button
            colorScheme="blue"
            variant="solid"
            type="submit"
            marginTop={3}
            isDisabled={isDone || !connectedAddress}
          >
            VERIFY
          </Button>
        </HStack>
      </form>
      {configs && (
        <CardInfo dataObject={configs}>Configuration details</CardInfo>
      )}
    </>
  );
};

export default ConfigsForm;
