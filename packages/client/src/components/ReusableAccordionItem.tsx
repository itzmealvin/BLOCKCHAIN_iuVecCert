import {
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
} from "@chakra-ui/react";
import { ReactNode } from "react";

interface Props {
  label: string;
  content: ReactNode;
  bgColor?: string;
}

const ReusableAccordionItem = ({ label, content, bgColor }: Props) => (
  <AccordionItem>
    <AccordionButton _expanded={{ bg: bgColor || "blue.400", color: "white" }}>
      <Box as="span" flex="1" textAlign="left">
        {label}
      </Box>
      <AccordionIcon />
    </AccordionButton>
    <AccordionPanel pb={4}>{content}</AccordionPanel>
  </AccordionItem>
);

export default ReusableAccordionItem;
