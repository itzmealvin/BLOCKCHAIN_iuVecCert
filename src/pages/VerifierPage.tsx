import { Center, VStack } from "@chakra-ui/react";
import CertsForm from "../components/CertsForm/CertsForm";
import Navigator from "../components/StepsIndicator/Navigator";
import ProgressSpine from "../components/StepsIndicator/ProgressSpine";
import { useVerifierStore, verifierSteps } from "../components/StepsIndicator/useStepsStores";

const VerifierPage = () => {
  const { isDone, currentStep, maxStep, nextStep, prevStep, resetStep } =
    useVerifierStore();
  return (
    <>
      <ProgressSpine stepDetails={verifierSteps} currentStep={currentStep}>
        Verifiers Path - Verifying Certificate - Step {currentStep + 1}
      </ProgressSpine>
      <Center>
        <VStack spacing={5} alignContent="center">
          {currentStep === 0 && <CertsForm mode={"VERIFY"}></CertsForm>}
          {/* {currentStep === 1 && <CalculateCoeffs></CalculateCoeffs>}
          {currentStep === 2 && <DeployBlockchain></DeployBlockchain>}
          {currentStep === 3 && <EmbedProof></EmbedProof>} */}
          <Navigator
            isDone={isDone}
            maxStep={maxStep!}
            currentStep={currentStep}
            prevStep={prevStep}
            nextStep={nextStep}
            resetStep={resetStep}
          />
        </VStack>
      </Center>
    </>
  );
};

export default VerifierPage;
