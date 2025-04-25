import {
  Box,
  Center,
  Heading,
  HStack,
  Link,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  VStack,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { Document, Page } from "react-pdf";
import ContractList from "../components/List/ContractList.tsx";
import PermissionList from "../components/List/PermissionList.tsx";
import ProofList from "../components/List/ProofList.tsx";
import ProgressSpine from "../components/ProgressSpine.tsx";
import UploadForm from "../components/UploadForm.tsx";
import useFileStore from "../hooks/useFileStore.ts";

const VerifierPage = () => {
  const { fileResult } = useFileStore();
  const [step, setStep] = useState(0);

  const hasFileResult = useMemo(
    () => Object.keys(fileResult).length !== 0,
    [fileResult],
  );

  const credFile = useMemo(
    () =>
      hasFileResult && fileResult.fileDetail.credBuffer
        ? { data: fileResult.fileDetail.credBuffer.slice() }
        : null,
    [hasFileResult, fileResult?.fileDetail?.credBuffer],
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
          IU-VecCert+ CLIENT - Verify Credential
        </Heading>
      </Box>
      <VStack justifyContent="center" spacing={10}>
        <ProgressSpine
          stepDetails={[
            { title: "Step 1", description: "Upload Credential(s)" },
            { title: "Step 2", description: "Confirm Issuer Permission" },
            { title: "Step 3", description: "Confirm Contract Information" },
            { title: "Step 4", description: "Check Technical Proof" },
            { title: "Step 5", description: "View Valid Credential Group" },
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
                    Credential {step === 5 ? "Group" : ""} preview
                  </Heading>

                  <Tabs variant="soft-rounded" colorScheme="green">
                    <TabList>
                      <Tab>CREDENTIAL</Tab>
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
                        <Document
                          file={credFile}
                          loading="Loading PDF Credential..."
                        >
                          <Page
                            pageNumber={1}
                            renderAnnotationLayer={false}
                            renderTextLayer={false}
                            scale={0.7}
                          />
                        </Document>
                      </TabPanel>
                      {appendixFiles.map((appendixFile, index) => (
                        <TabPanel key={index}>
                          <Document
                            file={appendixFile}
                            loading="Loading PDF Credential..."
                          >
                            <Page
                              pageNumber={1}
                              renderAnnotationLayer={false}
                              renderTextLayer={false}
                              scale={0.7}
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
                        The deployed{" "}
                        <Link
                          href={`https://sepolia.etherscan.io/address/${fileResult.fileDetail.commitAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          color="blue.500"
                        >
                          smart contract
                        </Link>{" "}
                        stored this information.
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
