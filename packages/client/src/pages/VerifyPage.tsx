import {
  Box,
  Center,
  Heading,
  HStack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Document, Page } from "react-pdf";
import ContractList from "../components/List/ContractList.tsx";
import PermissionList from "../components/List/PermissionList.tsx";
import ProofList from "../components/List/ProofList.tsx";
import ProgressSpine from "../components/ProgressSpine.tsx";
import UploadForm from "../components/UploadForm.tsx";
import useFileStore from "../hooks/useFileStore.ts";

const VerifierPage = () => {
  const { fileResult } = useFileStore();
  const [isRendered, setIsRendered] = useState(false);
  const [step, setStep] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!isRendered || !canvasRef.current) {
      return;
    }
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    const { width, height } = canvasRef.current;

    ctx.save();
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = "rgba(150, 150, 150, 0.5)";
    ctx.textAlign = "center";
    ctx.font = `${Math.max(width, height) / 60}px Arial`;
    ctx.translate(width / 2, height / 2);
    ctx.rotate((-45 * Math.PI) / 180);
    for (let x = -width; x < width * 5; x += width / 5) {
      for (let y = -height; y < height * 5; y += height / 5) {
        ctx.fillText("VERIFIED", x, y);
      }
    }
    ctx.restore();
  }, [isRendered, step]);

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

  const appendixFiles = useMemo(
    () =>
      hasFileResult && fileResult?.fileDetail?.appendixBuffers
        ? fileResult.fileDetail.appendixBuffers.map((buffer) => ({
          data: buffer.slice(),
        }))
        : [],
    [hasFileResult, fileResult?.fileDetail?.appendixBuffers],
  );

  return (
    <>
      <Box pt={10}>
        <Heading as="h1" size="2xl" textAlign="center" pb={10}>
          IUVecCert CLIENT - Verify Certificate
        </Heading>
      </Box>
      <VStack justifyContent="center" spacing={10}>
        <ProgressSpine
          stepDetails={[
            { title: "Step 1", description: "Upload Certificate(s)" },
            { title: "Step 2", description: "Confirm Issuer Permission" },
            { title: "Step 3", description: "Confirm Contract Information" },
            { title: "Step 4", description: "Check Verkle Proof" },
            { title: "Step 5", description: "View Valid Certificate Group" },
          ]}
          currentStep={step}
        />
        <Center>
          <VStack spacing={5} align="center">
            {!hasFileResult && (
              <UploadForm
                mode="VERIFY"
                setStep={() => setStep(1)}
              />
            )}
            {step >= 1 && (
              <HStack spacing={20}>
                <VStack>
                  <Heading as="h2" size="lg">
                    Certificate {step === 5 ? "Group" : ""} preview
                  </Heading>

                  <Tabs variant="soft-rounded" colorScheme="green">
                    <TabList>
                      <Tab>CERTIFICATE</Tab>
                      {fileResult.fileDetail.appendixFiles.map(
                        (appendixFile, index) => (
                          <Tab key={index} isDisabled={step !== 5}>
                            {appendixFile}
                          </Tab>
                        ),
                      )}
                    </TabList>
                    <TabPanels>
                      <TabPanel>
                        <Document file={certFile} loading="Loading PDF...">
                          <Page
                            pageNumber={1}
                            renderAnnotationLayer={false}
                            renderTextLayer={false}
                            scale={0.7}
                            onRenderSuccess={() => {
                              setIsRendered(true);
                            }}
                            canvasRef={step === 5 ? canvasRef : undefined}
                          />
                        </Document>
                      </TabPanel>
                      {appendixFiles.map((appendixFile, index) => (
                        <TabPanel key={index}>
                          <Document
                            file={appendixFile}
                            loading="Loading PDF..."
                          >
                            <Page
                              pageNumber={1}
                              renderAnnotationLayer={false}
                              renderTextLayer={false}
                              scale={0.7}
                              onRenderSuccess={() => {
                                setIsRendered(true);
                              }}
                              canvasRef={step === 5 ? canvasRef : undefined}
                            />
                          </Document>
                        </TabPanel>
                      ))}
                    </TabPanels>
                  </Tabs>
                </VStack>
                <VStack>
                  {step === 1 && (
                    <>
                      <Heading as="h2" size="lg">
                        Confirm the issuer validity
                      </Heading>
                      <Heading as="h3" size="md">
                        {`The X509 details that approved issuer address ${fileResult.fileDetail.deployerAddress}`}
                      </Heading>
                      <PermissionList
                        fileResult={fileResult}
                        handleClick={() => setStep(2)}
                      />
                    </>
                  )}
                  {step === 2 && (
                    <>
                      <Heading as="h2" size="lg">
                        Confirm the smart contract validity
                      </Heading>
                      <Heading as="h3" size="md">
                        The deployed smart contract stored these information
                      </Heading>
                      <ContractList
                        contract={fileResult.fileDetail.contractInstance}
                        fileResult={fileResult}
                        handleClick={() => setStep(3)}
                      />
                    </>
                  )}
                  {step === 3 && (
                    <>
                      <Heading as="h2" size="lg">
                        Verify technical proof
                      </Heading>

                      <ProofList
                        contract={fileResult.fileDetail.contractInstance}
                        fileResult={fileResult}
                        handleClick={() => setStep(5)}
                      />
                    </>
                  )}
                </VStack>
              </HStack>
            )}
          </VStack>
        </Center>
      </VStack>
    </>
  );
};

export default VerifierPage;
