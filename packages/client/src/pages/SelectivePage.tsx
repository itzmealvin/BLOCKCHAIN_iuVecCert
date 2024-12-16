import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Center,
  Checkbox,
  Heading,
  HStack,
  Link,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import fileDownload from "js-file-download";
import { PDFDocument } from "pdf-lib";
import { useEffect, useMemo, useRef, useState } from "react";
import { Document, Page } from "react-pdf";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ProgressSpine from "../components/ProgressSpine.tsx";
import UploadForm from "../components/UploadForm.tsx";
import useFileStore from "../hooks/useFileStore.ts";

const SelectivePage = () => {
  const { fileResult, resetFile } = useFileStore();
  const [checkedItems, setCheckedItems] = useState<number[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const [step, setStep] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
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
    ctx.font = `${Math.max(width, height) / 50}px Arial`;
    ctx.translate(width / 2, height / 2);
    ctx.rotate((-45 * Math.PI) / 180);
    for (let x = -width; x < width * 5; x += width / 5) {
      for (let y = -height; y < height * 5; y += height / 5) {
        ctx.fillText("DISCLOSED", x, y);
      }
    }
    ctx.restore();
  }, [isRendered, step]);

  const hasFileResult = useMemo(
    () => !!fileResult && Object.keys(fileResult).length > 0,
    [fileResult],
  );

  const certFile = useMemo(
    () =>
      hasFileResult && fileResult.fileDetail.certBuffer
        ? { data: fileResult.fileDetail.certBuffer.slice() }
        : null,
    [hasFileResult, fileResult?.fileDetail?.certBuffer],
  );

  const handleCheckboxChange = (index: number, isChecked: boolean) => {
    setCheckedItems((prev) =>
      isChecked ? [...prev, index] : prev.filter((item) => item !== index)
    );
  };

  const handleClose = () => {
    setLoading(false);
    onClose();
    setTimeout(() => {
      resetFile();
      navigate("/");
    }, 5000);
  };

  const handleDownload = async () => {
    setLoading(true);
    try {
      const newNames = fileResult.certKeywords.appendixFiles.filter((_, idx) =>
        checkedItems.includes(idx)
      );
      const newHashes = fileResult.certKeywords.appendixHashes.filter(
        (_, idx) => checkedItems.includes(idx),
      );

      const certDoc = await PDFDocument.load(fileResult.fileDetail.certBuffer);
      certDoc.setKeywords([
        JSON.stringify({
          ...fileResult.certKeywords,
          appendixNames: newNames,
          appendixHashes: newHashes,
        }),
      ]);
      await certDoc.attach(
        fileResult.fileDetail.permissionBuffer,
        "SIGNED.pdf",
      );
      await certDoc.attach(fileResult.fileDetail.certBuffer, "CERT.pdf");

      const pdfBytes = await certDoc.save();
      setStep(2);
      fileDownload(pdfBytes, `${fileResult.fileDetail.certName}`);
      setStep(3);
    } catch (error) {
      console.error(error);
      toast.error(
        "IUVecCert Error: Cannot generate requested embedded certificate",
      );
    } finally {
      toast.success(
        "IUVecCert: Success disclosure, will redirect to main page in 5 seconds",
      );
      handleClose();
    }
  };

  return (
    <>
      <Box pt={10}>
        <Heading as="h1" size="2xl" textAlign="center" pb={10}>
          IUVecCert CLIENT - Selective Disclosure
        </Heading>
      </Box>
      <VStack justifyContent="center" spacing={10}>
        <ProgressSpine
          stepDetails={[
            { title: "Step 1", description: "Upload Certificate" },
            { title: "Step 2", description: "Select Components" },
            { title: "Step 3", description: "Preview New Certificate" },
          ]}
          currentStep={step}
        />
        <Center>
          <VStack spacing={5} align="center">
            {!hasFileResult
              ? <UploadForm mode="REVOKE" setStep={() => setStep(1)} />
              : fileResult.certKeywords.appendixFiles.length > 0
              ? (
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
                        scale={0.7}
                        renderAnnotationLayer={false}
                        renderTextLayer={false}
                        onRenderSuccess={() => {
                          setIsRendered(true);
                        }}
                        canvasRef={step === 3 ? canvasRef : undefined}
                      />
                    </Document>
                  </VStack>
                  {step === 1 && (
                    <VStack>
                      <Heading as="h2" size="lg">
                        Select Appendix(s) to Disclose
                      </Heading>
                      <Heading as="h3" size="md">
                        {`Disclosed ${checkedItems.length} over ${fileResult.certKeywords.appendixFiles.length} presented components`}
                      </Heading>
                      {fileResult.certKeywords.appendixFiles.map(
                        (name, index) => (
                          <Checkbox
                            key={index}
                            isChecked={checkedItems.includes(index)}
                            colorScheme="green"
                            onChange={(e) =>
                              handleCheckboxChange(index, e.target.checked)}
                          >
                            Appendix {index + 1}: {name}
                          </Checkbox>
                        ),
                      )}
                      <Button colorScheme="red" onClick={onOpen} mt={3}>
                        DISCLOSE
                      </Button>
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
                              Selective Disclosure
                            </AlertDialogHeader>
                            <AlertDialogBody>
                              Are you sure? This action is irreversible unless
                              you keep the original certificate
                            </AlertDialogBody>
                            <AlertDialogFooter>
                              <Button ref={cancelRef} onClick={onClose}>
                                Cancel
                              </Button>
                              <Button
                                colorScheme="red"
                                onClick={handleDownload}
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
              )
              : (
                <>
                  <Heading as="h2" size="lg">
                    No appendix(s) detected
                  </Heading>
                  <Button colorScheme="blue" variant="ghost">
                    <Link
                      as={NavLink}
                      to="/"
                      _hover={{ textDecoration: "none" }}
                    >
                      Return to Homepage
                    </Link>
                  </Button>
                </>
              )}
          </VStack>
        </Center>
      </VStack>
    </>
  );
};

export default SelectivePage;
