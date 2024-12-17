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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Issuer, Subject } from "../../models/Certificate.ts";
import { FileResult } from "../../models/File.ts";
import { renderAsUTF8 } from "../../services/ConfigService.ts";
import ReusableAccordionItem from "../ReusableAccordionItem.tsx";

interface Props {
  fileResult: FileResult;
  handleClick: () => void;
}

interface CertData {
  field: string;
  condition: boolean;
  errorMsg: string | undefined;
}

const PermissionList = ({ fileResult, handleClick }: Props) => {
  type CheckedItems = Record<string, boolean>;
  const [checkedItems, setCheckedItems] = useState<CheckedItems>({});
  const [allChecked, setAllChecked] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef(null);

  const appendTypeToKeys = useCallback(
    (type: string, obj: Issuer | Subject): Record<string, string> => {
      return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [
          `${type}${capitalize(key)}`,
          value,
        ]),
      );
    },
    [],
  );

  const capitalize = (str: string): string =>
    str.charAt(0).toUpperCase() + str.slice(1);

  const showObjects = useMemo(() => {
    if (!fileResult) return [];
    return [
      appendTypeToKeys(
        "subject",
        fileResult.fileDetail.permissionResult.lastCert.issuedTo,
      ),
      !fileResult.fileDetail.permissionResult.authenticity &&
      appendTypeToKeys(
        "issuer",
        fileResult.fileDetail.permissionResult.lastCert.issuedBy,
      ),
      fileResult.fileDetail.permissionResult.expired &&
      fileResult.fileDetail.permissionResult.lastCert.validityPeriod,
    ];
  }, [appendTypeToKeys, fileResult]);

  useEffect(() => {
    const initialCheckedItems: CheckedItems = {};
    showObjects.forEach((obj) => {
      Object.keys(obj).forEach((key) => {
        initialCheckedItems[key] = false;
      });
    });
    setCheckedItems(initialCheckedItems);
  }, [showObjects]);

  useEffect(() => {
    setAllChecked(Object.values(checkedItems).every((isChecked) => isChecked));
  }, [checkedItems]);

  const handleCheckboxChange = (key: keyof typeof checkedItems) => {
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const data: CertData[] = [
    {
      field: "Authenticity",
      condition: !fileResult.fileDetail.permissionResult.authenticity,
      errorMsg: fileResult.fileDetail.permissionResult.errorMsg,
    },
    {
      field: "Expired",
      condition: fileResult.fileDetail.permissionResult.expired,
      errorMsg: fileResult.fileDetail.permissionResult.errorMsg,
    },
    {
      field: "Integrity",
      condition: !fileResult.fileDetail.permissionResult.integrity,
      errorMsg: fileResult.fileDetail.permissionResult.errorMsg,
    },
  ];

  return (
    <>
      <Accordion defaultIndex={[]} allowMultiple allowToggle>
        {data.map(({ field, condition, errorMsg }) => (
          <ReusableAccordionItem
            key={field}
            label={`${field}: ${
              condition ? `${errorMsg} (click to view more)` : "PASSED"
            }`}
            bgColor={condition ? "red" : "green"}
            content={condition
              ? (
                <>
                  Only check all the boxes if these fields match what you see on
                  the credential beside
                  {showObjects.map(
                    (showObject, index) =>
                      Object.keys(showObject).length > 0 &&
                      Object.entries(showObject).map(([key, value]) => (
                        <VStack alignItems="start" key={`${index}-${key}`}>
                          <Checkbox
                            size="lg"
                            colorScheme="red"
                            m={3}
                            isChecked={checkedItems[key] || false}
                            onChange={() =>
                              handleCheckboxChange(key)}
                          >
                            {key}: {renderAsUTF8(value)}
                          </Checkbox>
                        </VStack>
                      )),
                  )}
                </>
              )
              : (
                "This field is valid and require no additional confirmations"
              )}
          />
        ))}
      </Accordion>
      <Button
        colorScheme="red"
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
              Permission Validity
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure? You hold responsible for the information checked
              reported by the program
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleClick} ml={3}>
                Confirm
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default PermissionList;
