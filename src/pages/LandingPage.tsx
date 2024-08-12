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
                <Heading size="4xl">WELCOME TO IU-VerCert</Heading>
            </CardHeader>
            <CardBody>
                <Heading size="2xl">
                    A Verkle-Tree backed Credentials Issuance Protocol
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
                                IU-VerCert is empowered by Verkle trees, a sophisticated
                                cryptographic data structure. This advanced structure enable the
                                creation of verifiable systems that maintain the integrity of
                                sensitive information. By leveraging the unique properties of
                                Verkle trees, IU-VerCert ensures that secrets remain secure,
                                even in environments where data verification is essential. This
                                innovative approach allows for the development of robust and
                                trustworthy systems without compromising the confidentiality of
                                sensitive data and scalability for future-proof usage.
                            </AccordionPanel>
                        </AccordionItem>
                    </Accordion>
                </VStack>
            </CardFooter>
        </Card>
    );
};

export default LandingPage;
