import {
  Accordion,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  Checkbox,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { Contract } from "ethers";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { FileResult } from "../../models/File.ts";
import { addressLookup, renderAsUTF8 } from "../../services/ConfigService.ts";
import ReusableAccordionItem from "../ReusableAccordionItem.tsx";

interface Props {
  contract: Contract;
  fileResult: FileResult;
  handleClick: () => void;
}

interface ContractData {
  field: string;
  extracted?: string | Date;
  found: string;
  passed?: boolean;
}

const ContractList = ({ contract, fileResult, handleClick }: Props) => {
  const [contractData, setContractData] = useState<ContractData[]>([]);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef(null);

  const allChecked = Object.values(checkedItems).length > 0 &&
    Object.values(checkedItems).every((isChecked) => isChecked);

  const handleCheckboxChange = (key: string) => {
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    if (contractData.length > 0) {
      const initialCheckedState = contractData.reduce((acc, data) => {
        if (data.passed !== true) {
          Object.entries(data).forEach(([key]) => {
            if (key === "found" || key === "extracted") {
              acc[`${data.field}_${key}`] = false;
            }
          });
        }
        return acc;
      }, {} as Record<string, boolean>);
      setCheckedItems(initialCheckedState);
    }
  }, [contractData]);

  useEffect(() => {
    const loadContractData = async () => {
      try {
        const [issueTime, issuerCN, issuerOG, batchDesc] = await Promise.all([
          contract.issueTime(),
          contract.issuerCN(),
          contract.issuerOG(),
          contract.batchDesc(),
        ]);

        const deployerAddress = fileResult.fileDetail.deployerAddress ||
          "Unknown Address";
        const addressVerified = await addressLookup(
          fileResult.fileDetail.permissionBuffer.slice(),
          deployerAddress,
        );

        const { notBefore, notAfter } =
          fileResult.fileDetail.permissionResult.lastCert.validityPeriod;
        const issueTimeParsed = Number(issueTime) * 1000;

        const issueTimePassed =
          new Date(issueTimeParsed) >= new Date(notBefore) &&
          new Date(issueTimeParsed) <= new Date(notAfter);

        const newContractData: ContractData[] = [
          {
            field: "Issue Time",
            extracted: `Not before ${notBefore}/ Not after ${notAfter}`,
            found: new Date(issueTimeParsed).toLocaleString("vi-VN"),
            passed: issueTimePassed,
          },
          {
            field: "Issuer Address",
            found: deployerAddress,
            passed: addressVerified,
          },
          {
            field: "Issuer CN",
            extracted: renderAsUTF8(
              fileResult.fileDetail.permissionResult.lastCert.issuedTo
                .commonName,
            ),
            found: issuerCN,
            passed: issuerCN ===
              renderAsUTF8(
                fileResult.fileDetail.permissionResult.lastCert.issuedTo
                  .commonName,
              ),
          },
          {
            field: "Issuer OG",
            extracted: renderAsUTF8(
              fileResult.fileDetail.permissionResult.lastCert.issuedTo
                .organizationName,
            ),
            found: issuerOG,
            passed: issuerOG ===
              renderAsUTF8(
                fileResult.fileDetail.permissionResult.lastCert.issuedTo
                  .organizationName,
              ),
          },
          {
            field: "Batch Description",
            found: batchDesc,
          },
        ];
        setContractData(newContractData);
      } catch (error) {
        console.error(error);
        toast.error("IU-VecCert+ Error: Can't retrieve contract data");
      }
    };

    loadContractData();
  }, [contract, fileResult]);

  return (
    <>
      <Accordion defaultIndex={[]} allowMultiple allowToggle>
        {contractData.map(({ field, passed }) => (
          <ReusableAccordionItem
            key={field}
            bgColor={passed === true
              ? "green"
              : passed === false
              ? "red"
              : "yellow.500"}
            label={`${field}:
            ${
              passed === true
                ? "MATCHED"
                : passed === false
                ? "MISMATCHED"
                : "USER DECISION NEEDED (click to view more)"
            }`}
            content={passed !== true
              ? (
                <>
                  {" "}
                  Only check all the boxes if these fields match what you see on
                  the permission beside
                  {contractData.map(
                    (data) =>
                      data.passed !== true &&
                      data.field.match(field) &&
                      Object.keys(data).length > 0 &&
                      Object.entries(data).map(([key, value]) => {
                        if (key === "found" || key === "extracted") {
                          key = `${data.field}_${key}`;
                          return (
                            <VStack
                              alignItems="start"
                              key={`${data.field}_${key}`}
                            >
                              <Checkbox
                                size="lg"
                                colorScheme="yellow"
                                m={3}
                                isChecked={checkedItems[key] || false}
                                onChange={() => handleCheckboxChange(key)}
                              >
                                {key.toUpperCase()}: {renderAsUTF8(value)}
                              </Checkbox>
                            </VStack>
                          );
                        }
                        return null;
                      }),
                  )}
                </>
              )
              : (
                "This field is matched and require no additional confirmations"
              )}
          />
        ))}
      </Accordion>
      <Button
        colorScheme="yellow"
        variant="solid"
        onClick={onOpen}
        mt={3}
        isDisabled={!allChecked}
      >
        CONTINUE
      </Button>
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isCentered
        motionPreset="scale"
        size="2xl"
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Contract Details Validity
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure? You hold responsible for the information checked
              reported by the program
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="yellow" onClick={handleClick} ml={3}>
                Confirm
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default ContractList;
