import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  VStack,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";
import { CredsCommitment } from "../../../compiled/index.ts";
import { useEthersSigner } from "../hooks/useBlockchain.ts";
import useFileStore from "../hooks/useFileStore.ts";
import {
  getContractInstance,
  provider,
} from "../services/BlockchainService.ts";
import { getProofObject } from "../services/FileService.ts";

const schema = (mode: "VERIFY" | "REVOKE" | "SELECTIVE") => {
  return z.object({
    credentials: z
      .instanceof(FileList)
      .refine(
        (file) => (mode === "VERIFY" ? file?.length >= 1 : file?.length === 1),
        {
          message: mode === "VERIFY"
            ? "Please upload one credential with its appendix(s)"
            : "Please upload only one credential to be processed",
        },
      ),
  });
};

interface Props {
  mode: "VERIFY" | "REVOKE" | "SELECTIVE";
  setStep: () => void;
}

const UploadForm = ({ mode, setStep }: Props) => {
  const [isLoading, setLoading] = useState(false);
  const { setFileResult } = useFileStore();
  const signer = useEthersSigner();
  const chosenSchema = schema(mode);
  type InputSchema = z.infer<typeof chosenSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<InputSchema>({ resolver: zodResolver(chosenSchema) });

  const onSubmit = (
    data: InputSchema,
    mode: "VERIFY" | "REVOKE" | "SELECTIVE",
  ) => {
    setLoading(true);
    toast
      .promise(getProofObject(data.credentials, mode), {})
      .then(async (result) => {
        try {
          if (!result.fileDetail.commitAddress) {
            throw new Error(
              "IUVecCert Error: Cannot retrieve CredsCommitment contract address from this file",
            );
          }
          const contract = getContractInstance(
            result.fileDetail.commitAddress,
            CredsCommitment.abi,
            provider,
          );
          const contractDeployer = await contract.issuer();
          result.fileDetail.contractInstance = contract;
          result.fileDetail.deployerAddress = contractDeployer;

          if (
            mode === "REVOKE" &&
            signer &&
            result.fileDetail.deployerAddress !== (await signer.getAddress())
          ) {
            toast.error(
              "IUVecCert Error: Connected address and deployer address not match",
            );
            setLoading(false);
            return;
          }
          const [isRevoked, reason] = await contract.isRevoked(
            result.fileDetail.credHash,
          );

          if (isRevoked) {
            toast.error(
              `IUVecCert Error: This PDF credential has already been revoked. Reason: ${reason}`,
            );
            setLoading(false);
            return;
          }

          setFileResult(result);
          setStep();
          reset();
        } catch (error) {
          toast.error(`IUVecCert Error: ${error}`);
          console.error(error);
        } finally {
          setLoading(false);
          reset();
        }
      })
      .catch((error) => {
        toast.error(`IUVecCert ${error}`);
        console.error(error);
        setLoading(false);
        reset();
      });
  };

  const handleFormSubmit = (data: InputSchema) => {
    return onSubmit(data, mode);
  };

  return (
    <>
      <Heading as="h2" size="lg">
        {mode === "VERIFY"
          ? "Upload embedded credential and appendix(s) to verify"
          : mode === "REVOKE"
          ? "Upload embedded credential to revoke"
          : "Upload embedded credential to selective disclose"}
      </Heading>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <VStack spacing={5}>
          <FormControl isInvalid={!!errors.credentials}>
            <FormLabel htmlFor="credentials">
              Embedded Credential{mode === "VERIFY" ? "/Appendix(s)" : ""}
            </FormLabel>
            <Input
              {...register("credentials")}
              id="credentials"
              type="file"
              accept=".pdf"
              multiple={true}
            />
            <FormErrorMessage>{errors.credentials?.message}</FormErrorMessage>
          </FormControl>

          <Button
            colorScheme="blue"
            variant="solid"
            type="submit"
            mt={3}
            isLoading={isLoading}
          >
            SUBMIT
          </Button>
        </VStack>
      </form>
    </>
  );
};

export default UploadForm;
