import { Box, Button, Center, Heading, VStack } from "@chakra-ui/react";
import CertsForm from "../components/CertsForm";
import BlockchainServices from "../services/BlockchainServices";
import blockchainServices, { useEthersSigner } from "../services/BlockchainServices";
import useWeb3Store from "../hooks/useWeb3Store";
import CertCommitment from "../compiled";
import { toast } from "react-toastify";
import useFilesStore from "../hooks/useFilesStore";
import { resetVerifierStores } from "../services/resetStore";

const RevokeCerts = () => {
  const signer = useEthersSigner();
  const { contractAddress } = useWeb3Store();
  const { filesProps } = useFilesStore();

  const onVerifySubmit = async () => {
    try {
      const contract = blockchainServices.getContract(contractAddress, CertCommitment.abi, signer);
      if (signer && await BlockchainServices.performSignIn(signer) && contract) {
        const resultPromise = contract.isRevoked(filesProps[0].fileHash);
        await toast.promise(resultPromise, {
          error: "This certificate has already been revoked!",
        });
        const revokePromise = contract.revoke(filesProps[0].fileHash);
        await toast.promise(revokePromise, {
          pending: "Confirm transaction in your wallet",
          success: "Revoked! Now it can't be used",
          error: "Revoke failed! Try again later",
        });
      } else {
        resetVerifierStores();
      }
    } catch (e) {
      toast.error("Verification process failed!");
      resetVerifierStores();
    }
  };

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
          <Button colorScheme="blue" variant="solid" type="submit" marginTop={3} onClick={onVerifySubmit}
                  isDisabled={filesProps.length === 0}>
            REVOKE
          </Button>
          <CertsForm mode={"VERIFY"}></CertsForm>
        </VStack>
      </Center>
    </>
  );
};

export default RevokeCerts;
