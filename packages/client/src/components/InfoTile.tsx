import {
  Box,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import React from "react";

interface TileProps {
  title: string;
  description?: string | React.ReactElement;
}

const InfoTile = ({ title, description }: TileProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box
      p={3}
      borderWidth="thin"
      borderRadius="3xl"
      boxShadow="md"
      textAlign="center"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      h="18vh"
      onClick={onOpen}
    >
      {title === "IU-VecCert+"
        ? (
          <Text fontSize="6xl" fontWeight="extrabold">
            {title}
          </Text>
        )
        : (
          <>
            <Text
              bgClip="text"
              bgGradient="linear(to-br, cyan.400, blue.800)"
              fontSize="5xl"
              fontWeight="bold"
            >
              {title}
            </Text>
            <Modal
              isCentered
              isOpen={isOpen}
              onClose={onClose}
              motionPreset="scale"
              size="4xl"
            >
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>{title}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <Text fontSize="2xl">{description}</Text>
                </ModalBody>
              </ModalContent>
            </Modal>
          </>
        )}
    </Box>
  );
};

export default InfoTile;
