import {Button, Heading, List, ListIcon, ListItem, VStack} from "@chakra-ui/react";
import {useEffect, useRef} from "react";
import {FaEthereum} from "react-icons/fa";
import useConfigsStore from "../../hooks/useConfigsStore";
import ConfigsServices from "../../services/ConfigsServices";
import {JsonRpcProvider} from "ethers";
import useWeb3Store from "../../hooks/useWeb3Store";
import blockchainServices from "../../services/BlockchainServices";
import {CertCommitment} from "../../compiled";
import {toast} from "react-toastify";
import {useVerifierStore} from "../../hooks/useStepsStores";

const VerifyIssuer = () => {
    const {configs} = useConfigsStore();
    const {nextStep, toggleDone, isDone} = useVerifierStore();
    const provider = new JsonRpcProvider("https://rpc.sepolia.org", "sepolia");
    const {contractAddress, issuerAddress} = useWeb3Store();
    const verifyButtonRef = useRef<HTMLButtonElement>(null);
    const hasClickedRef = useRef(false);

    const handleCheck = () => {
        if (configs) {
            const x509s = ConfigsServices.splitCertificates(configs.certChain);
            if (ConfigsServices.verifySignature(issuerAddress, configs.signature, x509s[0])) {
                (async () => {
                    try {
                        const contract = blockchainServices.getContract(contractAddress, CertCommitment.abi, provider);
                        if (contract) {
                            const issuer = await contract.issuer();
                            if (issuer === issuerAddress) {
                                toast.success("This signature is valid and issuer match!");
                                if (!isDone) toggleDone();
                                setTimeout(() => {
                                    nextStep();
                                }, 2000);
                            } else {
                                toast.error("This signature is invalid or issuer not match!");
                                return;
                            }
                        }
                    } catch (error) {
                        toast.error("An error occurred!");
                    }
                })();
            }
        }
    };

    useEffect(() => {
        if (!isDone && !hasClickedRef.current && verifyButtonRef.current) {
            verifyButtonRef.current.click();
            hasClickedRef.current = true;
        }
    }, [isDone]);

    return (
        <>
            {isDone ? (
                <Heading as="h1" size="md">
                    Now continue to verify the secured-generated challenge
                </Heading>
            ) : (
                <Heading as="h1" size="md">
                    Verifying validity of signature and issuer address
                </Heading>
            )}
            <VStack spacing={10}>
                {issuerAddress && (
                    <List spacing={3}>
                        <ListItem>
                            <ListIcon as={FaEthereum} color="black.500"/>
                            Found Issuer Address: {issuerAddress}
                        </ListItem>
                    </List>
                )}
                <Button
                    ref={verifyButtonRef}
                    colorScheme="blue"
                    variant="solid"
                    onClick={handleCheck}
                    isDisabled={isDone}
                >
                    VERIFY
                </Button>
            </VStack>
        </>
    );
};

export default VerifyIssuer;