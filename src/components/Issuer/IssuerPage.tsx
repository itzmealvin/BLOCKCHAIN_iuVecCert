import { Center, VStack } from "@chakra-ui/react";
import CertsForm from "../CertsForm/CertsForm";
import ConfigsForm from "../ConfigsForm/ConfigsForm";
import Navigator from "../StepsIndicator/Navigator";
import ProgressSpine from "../StepsIndicator/ProgressSpine";
import { issuerSteps, useIssuerStore } from "../StepsIndicator/useStepsStores";
import CalculateCoeffs from "./CalculateCoeffs";
import DeployBlockchain from "./DeployBlockchain";
import EmbedProof from "./EmbedProof";

const IssuerPage = () => {
  const { isDone, currentStep, maxStep, nextStep, prevStep, resetStep } =
    useIssuerStore();
  return (
    <>
      <ProgressSpine stepDetails={issuerSteps} currentStep={currentStep}>
        Issuer Path - Creating Certificate Batch - Step {currentStep + 1}
      </ProgressSpine>
      <Center>
        <VStack spacing={5} alignContent="center">
          {currentStep === 0 && <ConfigsForm></ConfigsForm>}
          {currentStep === 1 && <CertsForm mode={"CREATE"}></CertsForm>}
          {currentStep === 2 && <CalculateCoeffs></CalculateCoeffs>}
          {currentStep === 3 && <DeployBlockchain></DeployBlockchain>}
          {currentStep === 4 && <EmbedProof></EmbedProof>}
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

export default IssuerPage;
