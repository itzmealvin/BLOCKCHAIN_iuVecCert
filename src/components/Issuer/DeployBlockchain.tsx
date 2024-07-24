import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Link,
  List,
  ListIcon,
  ListItem,
  Text,
  VStack,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { HashType, hashAsBigInt } from "bigint-hash";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaCheckCircle, FaUniversity } from "react-icons/fa";
import { toast } from "react-toastify";
import { z } from "zod";
import CertCommitment from "../../compiled";
import { useCommit } from "../../hooks/useCalculations";
import BlockchainServices, {
  ContractProps,
} from "../../services/BlockchainServices";
import useConfigsStore from "../ConfigsForm/useConfigsStore";
import { useIssuerStore } from "../StepsIndicator/useStepsStores";
import useWeb3AuthStore from "../Web3Auth/useWeb3AuthStore";
import useResultsStore from "./useResultsStore";

const schema = z.object({
  batchDesc: z
    .string()
    .length(8, {
      message: "Description length not valid, accepted 8 characters!",
    })
    .refine(
      (value) => {
        const pattern = /^S([1-3])AY(\d{2})(\d{2})$/;
        const match = value.match(pattern);
        if (match) {
          const firstTwoDigits = parseInt(match[2]);
          const lastTwoDigits = parseInt(match[3]);
          return lastTwoDigits === firstTwoDigits + 1;
        }
        return false;
      },
      {
        message:
          "Description not match: [S.AY....] where S only goes with 1,2,3; and AY only goes with 2 consecutive year (i.e.,  2223)!",
      },
    ),
});

type InputData = z.infer<typeof schema>;

const DeployBlockchain = () => {
  const {
    connectedDeployer: currentDeployer,
    contractAddress,
    setContractAddress,
  } = useWeb3AuthStore();
  const { coeffs, setCommitHash: setCoeffsCommit } = useResultsStore();
  const { issuerCN } = useConfigsStore();
  const { toggleDone } = useIssuerStore();
  const {
    data: commitObj,
    error,
    isLoading,
  } = useCommit({ values: coeffs.calculatedCoeffs });
  const [disabled, setDisabled] = useState(true);
  const [contractToDeploy, setContractToDeploy] = useState<ContractProps>({
    abi: CertCommitment.abi,
    bytecode: CertCommitment.bytecode,
    parameters: [],
  });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InputData>({ resolver: zodResolver(schema) });
  error ? toast.error(error.message) : null;

  const onHandleSubmit = (data: InputData) => {
    if (commitObj) {
      setCoeffsCommit(
        hashAsBigInt(
          HashType.SHA1,
          Buffer.from(commitObj.values.toString()),
        ).toString(),
      );
      setContractToDeploy((existingContract) => ({
        ...existingContract,
        parameters: [issuerCN, data.batchDesc, ...commitObj.values],
      }));
    }
    setDisabled(false);
    reset();
  };

  const handleDeploy = async () => {
    if (currentDeployer) {
      const promiseResult = BlockchainServices.deployContract(
        currentDeployer,
        contractToDeploy,
      );
      toast
        .promise(promiseResult, {
          pending: "Contract is being deployed",
          success: "Contract deployed!",
          error: "An unknown error occurred!",
        })
        .then((res) => {
          setContractAddress(res);
        })
        .catch((error) => toast.error(error));
      toggleDone();
    } else {
      toast.error("No wallet detected! Use Connect Wallet button to connect!");
    }
  };

  return (
    <>
      <Heading as="h1" size="md">
        Deploy contract with using these information
      </Heading>
      <VStack spacing={10}>
        <List spacing={3}>
          <ListItem>
            <ListIcon as={FaUniversity} color="black.500" />
            {issuerCN}
          </ListItem>
          {commitObj?.values.map((value) => (
            <ListItem key={value}>
              <ListIcon as={FaCheckCircle} color="black.500" />
              {value}
            </ListItem>
          ))}
        </List>
        <form
          onSubmit={handleSubmit((data, event) => {
            event?.preventDefault();
            onHandleSubmit(data);
          })}
        >
          <VStack spacing={5}>
            <FormControl isInvalid={!!errors.batchDesc}>
              <FormLabel htmlFor="certificates">Batch Description</FormLabel>
              <Input {...register("batchDesc")} id="batchDesc" type="text" />
              <FormErrorMessage>{errors.batchDesc?.message}</FormErrorMessage>
            </FormControl>
            <Button
              colorScheme="blue"
              variant="outline"
              type="submit"
              alignContent="center"
            >
              Submit Description
            </Button>
          </VStack>
        </form>
        <Button
          colorScheme="blue"
          variant="solid"
          onClick={() => {
            handleDeploy();
          }}
          isLoading={isLoading}
          isDisabled={disabled}
        >
          DEPLOY
        </Button>
      </VStack>
      {contractAddress && (
        <Text>
          Deployed Contract Address:{" "}
          <Link
            color="blue.500"
            target="_blank"
            rel="noopener noreferrer"
            href={`https://sepolia.etherscan.io/address/${contractAddress}`}
          >
            {contractAddress}
          </Link>
        </Text>
      )}
    </>
  );
};

export default DeployBlockchain;
