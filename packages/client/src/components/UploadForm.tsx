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
import { CertCommitment } from "../../../compiled/index.ts";
import { useEthersSigner } from "../hooks/useBlockchain.ts";
import useFileStore from "../hooks/useFileStore.ts";
import {
  getContractInstance,
  provider,
} from "../services/BlockchainService.ts";
import { getProofObject } from "../services/FileService.ts";

const schema = (mode: "VERIFY" | "REVOKE" | "SELECTIVE") => {
  return z.object({
    certificates: z
      .instanceof(FileList)
      .refine(
        (file) => (mode === "VERIFY" ? file?.length >= 1 : file?.length === 1),
        {
          message: mode === "VERIFY"
            ? "Please upload one certificate with its appendix(s)"
            : "Please upload only one certificate to be processed",
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
      .promise(getProofObject(data.certificates, mode), {})
      .then(async (result) => {
        try {
          const contract = getContractInstance(
            result.fileDetail.commitAddress,
            CertCommitment.abi,
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
            result.fileDetail.certHash,
          );

          if (isRevoked) {
            toast.error(
              `IUVecCert Error: This PDF certificate has already been revoked. Reason: ${reason}`,
            );
            setLoading(false);
            return;
          }

          setFileResult(result);
          setStep();
          reset();
        } catch (error) {
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
          ? "Upload embedded certificate and appendix(s) to verify"
          : mode === "REVOKE"
          ? "Upload embedded certificate to revoke"
          : "Upload embedded certificate to selective disclose"}
      </Heading>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <VStack spacing={5}>
          <FormControl isInvalid={!!errors.certificates}>
            <FormLabel htmlFor="certificates">
              Embedded Certificate{mode === "VERIFY" ? "/Appendix(s)" : ""}
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
