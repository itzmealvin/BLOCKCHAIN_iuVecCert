import {Box, Button, Center, Heading, List, ListIcon, ListItem, VStack} from "@chakra-ui/react";
import CertsForm from "../components/CertsForm";
import BlockchainServices from "../services/BlockchainServices";
import blockchainServices, {useEthersSigner} from "../services/BlockchainServices";
import useWeb3Store from "../hooks/useWeb3Store";
import CertCommitment from "../compiled";
import {toast} from "react-toastify";
import useFilesStore from "../hooks/useFilesStore";
import {resetIssuerStores} from "../services/resetStore";
import {FaEthereum} from "react-icons/fa";
import {useState} from "react";

const RevokePage = () => {
    const signer = useEthersSigner();
    const [isDisabled, setDisabled] = useState(false);
    const {contractAddress, issuerAddress} = useWeb3Store();
    const {filesProps} = useFilesStore();

    const onVerifySubmit = async () => {
        setDisabled(true);
        try {
            if (signer && signer.address == issuerAddress) {
                const contract = blockchainServices.getContract(contractAddress, CertCommitment.abi, signer);
                if (contract && await BlockchainServices.performSignIn(signer, "I am the issuer of this deployment!")) {
                    const revokePromise = contract.revoke(filesProps[0].fileHash);
                    await toast.promise(revokePromise, {
                        pending: "Confirm transaction in your wallet",
                        success: "Revoked! Now it can't be used",
                        error: "Revoke failed! Try again later",
                    });
                    resetIssuerStores();
                } else {
                    resetIssuerStores();
                }
            } else {
                toast.error("Issuer address and current wallet address not match!")
            }
        } catch (e) {
            toast.error("Verification process failed!");
        }
        setDisabled(false);
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
                            isDisabled={filesProps.length === 0 || !signer || isDisabled}>
                        REVOKE
                    </Button>
                    {issuerAddress && (
                        <>
                            <List spacing={3}>
                                <ListItem>
                                    <ListIcon as={FaEthereum} color="black.500"/>
                                    Found Issuer Address: {issuerAddress}
                                </ListItem>
                            </List>
                        </>)}
                    <CertsForm mode={"REVOKE"}></CertsForm>
                </VStack>
            </Center>
        </>
    );
};

export default RevokePage;
