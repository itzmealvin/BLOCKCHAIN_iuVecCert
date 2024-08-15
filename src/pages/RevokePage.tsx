import {Box, Button, Center, Flex, Heading, VStack} from "@chakra-ui/react";
import CertsForm from "../components/CertsForm";
import BlockchainServices from "../services/BlockchainServices";
import blockchainServices, {useEthersSigner} from "../services/BlockchainServices";
import useWeb3Store from "../hooks/useWeb3Store";
import CertCommitment from "../compiled";
import {toast} from "react-toastify";
import useFilesStore from "../hooks/useFilesStore";
import {resetVerifierStores} from "../services/resetStore";
import {FaCheckCircle} from "react-icons/fa";

const RevokePage = () => {
    const signer = useEthersSigner();
    const {contractAddress, issuerAddress} = useWeb3Store();
    const {filesProps} = useFilesStore();

    const onVerifySubmit = async () => {
        try {
            if (signer && signer.address == issuerAddress) {
                const contract = blockchainServices.getContract(contractAddress, CertCommitment.abi, signer);
                if (contract && await BlockchainServices.performSignIn(signer, "I am the issuer of this batch deployment!")) {
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
            } else {
            }
            toast.error("Issuer address and current wallet address not match!")
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
                            isDisabled={filesProps.length === 0 || !signer}>
                        REVOKE
                    </Button>
                    <Heading as="h2" size="sx" textAlign="center">
                        {!issuerAddress ? (
                            "No issuer address found!"
                        ) : (
                            <Flex align="center" justify="center">
                                <FaCheckCircle/> {`Found issuer address: ${issuerAddress}`}
                            </Flex>
                        )}
                    </Heading>
                    <CertsForm mode={"VERIFY"}></CertsForm>
                </VStack>
            </Center>
        </>
    );
};

export default RevokePage;
