import { Button, HStack, Link as ChakraLink } from "@chakra-ui/react";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import { Link as ReactRouterLink } from "react-router-dom";
import { toast } from "react-toastify";
import ConfirmModal from "../Elements/ConfirmModal";
import { resetIssuerStores } from "../../services/resetStore";

interface Props {
  isDone: boolean;
  currentStep: number;
  maxStep: number;
  prevStep: () => void;
  nextStep: () => void;
  resetStep: () => void;
}

const Navigator = ({
                     isDone,
                     currentStep,
                     maxStep,
                     prevStep,
                     nextStep,
                     resetStep,
                   }: Props) => {
  const onReset = () => {
    resetIssuerStores();
    toast.success("All progress cleared!");
  };

  return (
    <HStack>
      {currentStep !== 0 && (
        <Button
          colorScheme="blue"
          variant="ghost"
          isDisabled={currentStep === 0}
          onClick={prevStep}
        >
          <FaAngleLeft />
          Previous
        </Button>
      )}
      <ConfirmModal action={onReset}>Reset All</ConfirmModal>
      <Button
        colorScheme="blue"
        variant="ghost"
        isDisabled={!isDone}
        onClick={nextStep}
      >
        {currentStep !== maxStep - 1 ? (
          <>
            Next <FaAngleRight />
          </>
        ) : (
          <ChakraLink as={ReactRouterLink} to="/">
            Return to Homepage
          </ChakraLink>
        )}
      </Button>
    </HStack>
  );
};

export default Navigator;
