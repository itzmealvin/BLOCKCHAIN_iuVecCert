import { Box, Center, Heading, VStack } from "@chakra-ui/react";
import CertsForm from "../components/CertsForm";
import { useEthersSigner } from "../services/BlockchainServices";

const RevokeCerts = () => {
const signer = useEthersSigner();


  return (
    <>
      <Box padding={10}>
        <Heading as="h1" size="lg" textAlign="center" paddingBottom={10}>
          {!signer
            ? "Connect a wallet to begin revoke certificate!"
            : "Issuer Path - Revoking Certificate Validity"}
        </Heading>
      </Box>
      <Center>
        <VStack spacing={5} alignContent="center">
          <CertsForm mode={"VERIFY"}></CertsForm>
        </VStack>
      </Center>
    </>
  );
};

export default RevokeCerts;
