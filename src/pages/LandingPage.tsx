import {
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Box,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    Heading,
    VStack,
} from "@chakra-ui/react";

const LandingPage = () => {
    return (
        <Card align="center" marginY={20}>
            <CardHeader>
                <Heading size="4xl">WELCOME TO IU-VecCert</Heading>
            </CardHeader>
            <CardBody>
                <Heading size="2xl">
                    A Vector Commitment backed Credentials Issuance Protocol
                </Heading>
            </CardBody>
            <CardFooter>
                <VStack spacing={5}>
                    <Heading size="xl">
                        Without compromising your secret and storage size...
                    </Heading>
                    <Accordion allowToggle>
                        <AccordionItem>
                            <AccordionButton _expanded={{bg: "dodgerblue", color: "white"}}>
                                <Box as="span" flex="1" textAlign="left">
                                    Click here to see why it can!
                                </Box>
                                <AccordionIcon/>
                            </AccordionButton>
                            <AccordionPanel>
                                IU-VecCert, powered by Vector Commitment, is a sophisticated cryptographic data
                                structure that offers constant proof size and enhances efficiency and scalability. This
                                advanced structure enables the creation of verifiable systems that ensure the integrity
                                of sensitive information while maintaining minimal proof overhead, regardless of the
                                dataset's size. By leveraging the unique properties of Vector Commitment, IU-VecCert
                                ensures secrets remain secure and easily verifiable, even in environments where frequent
                                data verification is required. This approach preserves confidentiality and provides a
                                future-proof solution due to its scalability and constant proof size benefits, ensuring
                                IU-VecCert’s adaptability to future data needs.
                            </AccordionPanel>
                        </AccordionItem>
                    </Accordion>
                </VStack>
            </CardFooter>
        </Card>
    );
};

export default LandingPage;
