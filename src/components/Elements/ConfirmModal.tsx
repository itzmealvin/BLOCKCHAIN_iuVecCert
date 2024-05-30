import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  useDisclosure,
} from "@chakra-ui/react";
import React, { ReactNode } from "react";

interface Props {
  children: ReactNode;
  action: () => void;
}

const ConfirmModal = ({ children, action }: Props) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef(null);

  return (
    <>
      <Button variant="outline" colorScheme="red" onClick={onOpen}>
        {children}
      </Button>
      <AlertDialog
        motionPreset="scale"
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isOpen={isOpen}
      >
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader>{children}?</AlertDialogHeader>
          <AlertDialogCloseButton />
          <AlertDialogBody>
            Are you sure you want to {children?.toString().toLowerCase()}? This
            action cannot be undone!
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose} variant="outline">
              Cancel
            </Button>
            <Button
              colorScheme="red"
              variant="solid"
              ml={3}
              onClick={() => {
                action();
                onClose();
              }}
            >
              Continue
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ConfirmModal;
