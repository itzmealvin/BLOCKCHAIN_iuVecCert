import { Center, VStack } from "@chakra-ui/react";
import CertsForm from "../components/CertsForm/CertsForm";
import ConfigsForm from "../components/ConfigsForm/ConfigsForm";
import Navigator from "../components/StepsIndicator/Navigator";
import ProgressSpine from "../components/StepsIndicator/ProgressSpine";
import { issuerSteps, useIssuerStore } from "../components/StepsIndicator/useStepsStores";
import CalculateCoeffs from "../components/Issuer/CalculateCoeffs";
import DeployBlockchain from "../components/Issuer/DeployBlockchain";
import EmbedProof from "../components/Issuer/EmbedProof";

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
