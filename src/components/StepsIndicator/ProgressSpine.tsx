import {
    Box,
    Heading,
    Step,
    StepDescription,
    StepIcon,
    StepIndicator,
    StepNumber,
    Stepper,
    StepSeparator,
    StepStatus,
    StepTitle,
} from "@chakra-ui/react";
import {ReactNode} from "react";
import {StepsDetails} from "../../hooks/useStepsStores";

interface Props {
    stepDetails: StepsDetails[];
    currentStep: number;
    children: ReactNode;
}

const ProgressSpine = ({stepDetails, currentStep, children}: Props) => {
    return (
        <Box padding={10}>
            <Heading as="h1" size="lg" textAlign="center" paddingBottom={10}>
                {children}
            </Heading>
            <Stepper index={currentStep} paddingBottom={5}>
                {stepDetails.map((step, index) => (
                    <Step key={index}>
                        <StepIndicator>
                            <StepStatus
                                complete={<StepIcon/>}
                                incomplete={<StepNumber/>}
                                active={<StepNumber/>}
                            />
                        </StepIndicator>
                        <Box flexShrink="0">
                            <StepTitle>{step.title}</StepTitle>
                            <StepDescription>{step.description}</StepDescription>
                        </Box>
                        <StepSeparator/>
                    </Step>
                ))}
            </Stepper>
        </Box>
    );
};

export default ProgressSpine;
