import {
  Accordion,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Center,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  HStack,
  Input,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useRef, useState } from "react";
import { FieldError, useForm } from "react-hook-form";
import { Document, Page } from "react-pdf";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { z } from "zod";
import { CertCommitment } from "../../../compiled/index.ts";
import ProgressSpine from "../components/ProgressSpine.tsx";
import ReuseableAccordionItem from "../components/ReusableAccordionItem.tsx";
import UploadForm from "../components/UploadForm.tsx";
import { useEthersSigner } from "../hooks/useBlockchain.ts";
import useFileStore from "../hooks/useFileStore.ts";
import { useFormData } from "../hooks/useFormData.ts";
import { getContractInstance } from "../services/BlockchainService.ts";

const schema = (fieldData: { [key: string]: string } | null) => {
  const fieldValidations: Record<string, unknown> = {};

  if (fieldData) {
    Object.keys(fieldData).forEach((fieldName) => {
      const fieldValue = fieldData[fieldName];
      fieldValidations[fieldName] = z
        .string()
        .refine((value) => value === fieldValue, {
          message: `The value for ${fieldName} must match the extracted value`,
        });
    });
  }

  return z.object({
    revokeReason: z.string().min(5, {
      message: "Reason for revoke must be over 5 characters long",
    }),
    ...fieldValidations,
  });
};

const RevokePage = () => {
  const { fileResult } = useFileStore();
  const signer = useEthersSigner();
  const [isLoading, setLoading] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const [step, setStep] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [inputData, setInputData] = useState<InputSchema>({} as InputSchema);
  const cancelRef = useRef(null);
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!isRendered || !canvasRef.current) {
      return;
    }
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    const { width, height } = canvasRef.current;

    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = "rgba(150, 150, 150, 0.5)";
    ctx.textAlign = "center";
    ctx.font = `${Math.max(width, height) / 40}px Arial`;
    ctx.translate(width / 2, height / 2);
    ctx.rotate((-45 * Math.PI) / 180);
    for (let x = -width; x < width * 5; x += width / 5) {
      for (let y = -height; y < height * 5; y += height / 5) {
        ctx.fillText("REVOKED", x, y);
      }
    }
    ctx.restore();
  }, [isRendered, step]);

  const handleClose = () => {
    setLoading(false);
    reset();
    onClose();
    setTimeout(() => {
      navigate("/");
    }, 5000);
  };

  const hasFileResult = useMemo(
    () => Object.keys(fileResult).length !== 0,
    [fileResult],
  );

  const certFile = useMemo(
    () =>
      hasFileResult && fileResult.fileDetail.certBuffer
        ? { data: fileResult.fileDetail.certBuffer.slice() }
        : null,
    [hasFileResult, fileResult?.fileDetail?.certBuffer],
  );

  const fieldData = useFormData(
    hasFileResult ? fileResult?.fileDetail?.certBuffer : null,
  );

  const finalSchema = schema(fieldData);
  type InputSchema = z.infer<typeof finalSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<InputSchema>({
    resolver: zodResolver(finalSchema),
  });

  const handleFormSubmit = (data: InputSchema) => {
    setInputData(data);
    setStep(2);
    onOpen();
  };

  const handleRevoke = async () => {
    if (!signer) return;
    setLoading(true);
    const commitmentContract = getContractInstance(
      fileResult.fileDetail.commitAddress,
      CertCommitment.abi,
      signer,
    );
    const revokeTxn = commitmentContract.revoke(
      fileResult.fileDetail.certHash,
      inputData.revokeReason,
    );
    await toast
      .promise(revokeTxn, {
        pending: "Approve transaction in the wallet",
      })
      .then(async (res) => {
        await toast
          .promise(res.wait(1), {
            pending: "Waiting for confirmation",
            success:
              "IUVecCert: Success revocation, will redirect to main page in 5 seconds",
            error: "IUVecCert Error: Cannot revoke",
          })
          .finally(() => {
            setStep(3);
            handleClose();
          });
      })
      .catch((_error) => {
        setLoading(false);
        toast.error("IUVecCert Error: User denied transaction");
      });
  };

  return (
    <>
      <Box pt={10}>
        <Heading as="h1" size="2xl" textAlign="center" pb={10}>
          {!signer
            ? "Connect your wallet to revoke certificate securely"
            : "IUVecCert CLIENT - Revoke Certificate"}
        </Heading>
      </Box>
      <VStack justifyContent="center" spacing={10}>
        <ProgressSpine
          stepDetails={[
            { title: "Step 1", description: "Upload Certificate" },
            { title: "Step 2", description: "Enter Details" },
            { title: "Step 3", description: "Wait Confirmation" },
          ]}
          currentStep={step}
        />
        <Center>
          <VStack spacing={5} align="center">
            {!hasFileResult
              ? <UploadForm mode="REVOKE" setStep={() => setStep(1)} />
              : (
                <HStack spacing={20}>
                  <VStack>
                    <Heading as="h2" size="lg">
                      Certificate Preview
                    </Heading>
                    <Document
                      file={certFile}
                      loading="Loading PDF Certificate..."
                    >
                      <Page
                        pageNumber={1}
                        renderAnnotationLayer={false}
                        renderTextLayer={false}
                        scale={0.7}
                        onRenderSuccess={() => {
                          setIsRendered(true);
                        }}
                        canvasRef={step == 3 ? canvasRef : undefined}
                      />
                    </Document>
                  </VStack>
                  {step !== 3 && (
                    <VStack>
                      <Heading as="h2" size="lg">
                        Enter revoke details
                      </Heading>
                      <Heading as="h3" size="md">
                        Type exactly what you see on the certificate beside
                      </Heading>
                      <Accordion defaultIndex={[]} allowMultiple allowToggle>
                        <ReuseableAccordionItem
                          label="View contract address"
                          content={fileResult.fileDetail.commitAddress}
                        />
                        <ReuseableAccordionItem
                          label="View hash value"
                          content={fileResult.fileDetail.certHash}
                        />
                      </Accordion>
                      <form onSubmit={handleSubmit(handleFormSubmit)}>
                        <VStack spacing={3}>
                          <Grid templateColumns="repeat(3, 1fr)" gap={6}>
                            <GridItem colSpan={1}>
                              <FormControl isInvalid={!!errors.revokeReason}>
                                <FormLabel htmlFor="revokeReason">
                                  Revoke Reason
                                </FormLabel>
                                <Input
                                  {...register("revokeReason")}
                                  id="revokeReason"
                                  type="text"
                                />
                                <FormErrorMessage>
                                  {errors.revokeReason?.message}
                                </FormErrorMessage>
                              </FormControl>
                            </GridItem>

                            {fieldData &&
                              Object.keys(fieldData).map((fieldName) => (
                                <GridItem key={fieldName} colSpan={1}>
                                  <FormControl
                                    isInvalid={!!(errors as Record<
                                      string,
                                      FieldError
                                    >)[
                                      fieldName
                                    ]}
                                  >
                                    <FormLabel htmlFor={fieldName}>
                                      {fieldName.toUpperCase()}
                                    </FormLabel>
                                    <Input
                                      {...register(
                                        fieldName as keyof InputSchema,
                                      )}
                                      id={fieldName}
                                      type="text"
                                    />
                                    <FormErrorMessage>
                                      {(errors as Record<string, FieldError>)[
                                        fieldName
                                      ]?.message}
                                    </FormErrorMessage>
                                  </FormControl>
                                </GridItem>
                              ))}
                          </Grid>
                          <Button
                            colorScheme="red"
                            variant="solid"
                            type="submit"
                            isDisabled={!signer || !hasFileResult}
                            mt={2}
                          >
                            REVOKE
                          </Button>
                        </VStack>
                      </form>

                      <AlertDialog
                        isOpen={isOpen}
                        leastDestructiveRef={cancelRef}
                        onClose={handleClose}
                        isCentered
                        motionPreset="scale"
                        size="2xl"
                      >
                        <AlertDialogOverlay>
                          <AlertDialogContent>
                            <AlertDialogHeader fontSize="lg" fontWeight="bold">
                              Revoke Certificate
                            </AlertDialogHeader>
                            <AlertDialogBody>
                              Are you sure? This action is irreversible and will
                              be recorded permanently on the blockchain
                            </AlertDialogBody>
                            <AlertDialogFooter>
                              <Button ref={cancelRef} onClick={onClose}>
                                Cancel
                              </Button>
                              <Button
                                colorScheme="red"
                                onClick={handleRevoke}
                                ml={3}
                                isLoading={isLoading}
                              >
                                Confirm
                              </Button>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialogOverlay>
                      </AlertDialog>
                    </VStack>
                  )}
                </HStack>
              )}
          </VStack>
        </Center>
      </VStack>
    </>
  );
};

export default RevokePage;
