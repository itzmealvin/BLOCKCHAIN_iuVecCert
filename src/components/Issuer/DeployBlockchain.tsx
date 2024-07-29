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

import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaCheckCircle, FaQuestionCircle, FaUniversity } from "react-icons/fa";
import { toast } from "react-toastify";
import { z } from "zod";
import CertCommitment from "../../compiled";
import { useCommit } from "../../hooks/useCalculations";
import BlockchainServices, { ContractProps } from "../../services/BlockchainServices";
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
  const { coeffs, setCommitResult } = useResultsStore();
  const { issuerCN } = useConfigsStore();
  const { toggleDone } = useIssuerStore();
  const {
    data: commitObj,
    error,
    isLoading,
  } = useCommit({ values: coeffs.calculatedCoeffs });
  const [txnHash, setTxnHash] = useState("");
  const [disabled, setDisabled] = useState(true);
  const [contractToDeploy, setContractToDeploy] = useState<ContractProps>({
    abi: CertCommitment.abi,
    bytecode: CertCommitment.bytecode,
    parameters: [],
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InputData>({ resolver: zodResolver(schema) });
  error ? toast.error(error.message) : null;

  const onHandleSubmit = (data: InputData) => {
    if (commitObj?.challenge) {
      setCommitResult(commitObj);
      setContractToDeploy((existingContract) => ({
        ...existingContract,
        parameters: [
          issuerCN,
          data.batchDesc,
          ...commitObj.challenge!.commitment,
          commitObj.challenge!.index,
          commitObj.challenge!.value,
          ...commitObj.challenge!.proof,
        ],
      }));
    }
    setDisabled(false);
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
          setTxnHash(res.hash);
          setContractAddress(res.address);
        })
        .catch((error) => toast.error(error));
      toggleDone();
    } else {
      toast.error("No wallet detected! Use Connect Wallet button to connect!");
    }
  };

  const truncateString = (str: string, num: number) => {
    if (str.length <= num * 2) {
      return str;
    }
    return str.slice(0, num) + "..." + str.slice(-num);
  };

  return (
    <>
    {commitObj ?
      <Heading as="h1" size="md">
        Now deploy the storing contract with using these given information!
      </Heading> :  <Heading as="h1" size="md">
        Calculating commitment for the given polynomials and generating unique challenge point!
      </Heading> }
      <VStack spacing={10}>
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
        {commitObj?.challenge && ( <> <List spacing={3}>
          <ListItem>
            <ListIcon as={FaUniversity} color="black.500" />
            CN: {issuerCN}
          </ListItem>
              <ListItem key="challenge">
                <ListIcon as={FaQuestionCircle} color="black.500" />
                Challenge: ({truncateString(commitObj.challenge.index, 5)},
                {truncateString(commitObj.challenge.value, 5)})
              </ListItem>
              {commitObj?.challenge.commitment.map((value, index) => (
                <ListItem key={value}>
                  <ListIcon as={FaCheckCircle} color="black.500" />
                  Commitment {index}: {value}
                </ListItem>
              ))}
        </List> </>
          )}
        <form
          onSubmit={handleSubmit((data, event) => {
            event?.preventDefault();
            onHandleSubmit(data);
          })}
        >
          <VStack spacing={5}>
            <FormControl isInvalid={!!errors.batchDesc}>
              <FormLabel htmlFor="certificates">Batch description</FormLabel>
              <Input {...register("batchDesc")} id="batchDesc" type="text" />
              <FormErrorMessage>{errors.batchDesc?.message}</FormErrorMessage>
            </FormControl>
            <Button
              colorScheme="blue"
              variant="outline"
              type="submit"
              alignContent="center"
            >
              SUBMIT
            </Button>
          </VStack>
        </form>
      </VStack>
      {contractAddress && txnHash && (
        <>
          <Text>
            Transaction Hash:{" "}
            <Link
              color="blue.500"
              target="_blank"
              rel="noopener noreferrer"
              href={`https://sepolia.etherscan.io/tx/${txnHash}`}
            >
              View on Sepolia Scan
            </Link>
          </Text>
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
        </>
      )}
    </>
  );
};

export default DeployBlockchain;
