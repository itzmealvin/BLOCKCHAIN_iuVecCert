import {
  Box,
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

export interface StepsDetails {
  title: string;
  description: string;
}

interface Props {
  stepDetails: StepsDetails[];
  currentStep: number;
}

const ProgressSpine = ({ stepDetails, currentStep }: Props) => {
  return (
    <Stepper index={currentStep} w="120vh">
      {stepDetails.map(({ title, description }) => (
        <Step key={title}>
          <StepIndicator>
            <StepStatus
              complete={<StepIcon />}
              incomplete={<StepNumber />}
              active={<StepNumber />}
            />
          </StepIndicator>
          <Box flexShrink={0}>
            <StepTitle>{title}</StepTitle>
            <StepDescription>{description}</StepDescription>
          </Box>
          <StepSeparator />
        </Step>
      ))}
    </Stepper>
  );
};

export default ProgressSpine;
