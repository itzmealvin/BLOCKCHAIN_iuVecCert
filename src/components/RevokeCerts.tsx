import { Box, Center, Heading, VStack } from "@chakra-ui/react";
import CertsForm from "./CertsForm/CertsForm";
import useWeb3AuthStore from "./Web3Auth/useWeb3AuthStore";

const RevokeCerts = () => {
  const { connectedAddress } = useWeb3AuthStore();
  
  return (
    <>
      <Box padding={10}>
        <Heading as="h1" size="md" textAlign="center">
          {!connectedAddress
            ? "Connect a wallet to begin revoke certificate!"
            : "Upload an embedded certificate to revoke it"}
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
