import {Center, VStack} from "@chakra-ui/react";
import CertsForm from "../components/CertsForm";
import ProgressSpine from "../components/StepsIndicator/ProgressSpine";
import {useVerifierStore, verifierSteps} from "../hooks/useStepsStores";
import VerifyChainCN from "../components/Verifier/VerifyChainCN";
import VerifyIssuer from "../components/Verifier/VerifyIssuer";
import VerifyCertificate from "../components/Verifier/VerifyCertificate";

const VerifierPage = () => {
    const {currentStep} =
        useVerifierStore();
    return (
        <>
            <ProgressSpine stepDetails={verifierSteps} currentStep={currentStep}>
                Verifiers Path - Verifying Certificate - Step {currentStep + 1}
            </ProgressSpine>
            <Center>
                <VStack spacing={5} alignContent="center">
                    {currentStep === 0 && <CertsForm mode={"VERIFY"}></CertsForm>}
                    {currentStep === 1 && <VerifyChainCN/>}
                    {currentStep === 2 && <VerifyIssuer/>}
                    {currentStep === 3 && <VerifyCertificate/>}
                </VStack>
            </Center>
        </>
    );
};

export default VerifierPage;
