import {Button, Heading, List, ListIcon, ListItem, VStack,} from "@chakra-ui/react";
import {useEffect, useRef, useState} from "react";
import {FaUniversity} from "react-icons/fa";
import useConfigsStore from "../../hooks/useConfigsStore";
import ConfigsServices from "../../services/ConfigsServices";
import {JsonRpcProvider} from "ethers";
import useWeb3Store from "../../hooks/useWeb3Store";
import blockchainServices from "../../services/BlockchainServices";
import CertCommitment from "../../compiled";
import {toast} from "react-toastify";
import {useVerifierStore} from "../../hooks/useStepsStores";

const VerifyChainCN = () => {
    const {configs} = useConfigsStore();
    const [isDone, setIsDone] = useState(false);
    const [issuerCN, setIssuerCN] = useState();
    const provider = new JsonRpcProvider("https://rpc.sepolia.org", "sepolia");
    const {contractAddress} = useWeb3Store();
    const {nextStep} = useVerifierStore();
    const verifyButtonRef = useRef<HTMLButtonElement>(null);

    const handleCheck = () => {
        if (configs) {
            const x509s = ConfigsServices.splitCertificates(configs.certChain);
            if (ConfigsServices.verifyX509Chain(x509s)) {
                (async () => {
                    try {
                        const contract = blockchainServices.getContract(contractAddress, CertCommitment.abi, provider);
                        if (contract) {
                            const issuerCN = await contract.issuerCN();
                            setIssuerCN(issuerCN);
                            const cert = ConfigsServices.extractCertChain(configs.certChain);
                            if (ConfigsServices.getField(cert, "CN") === issuerCN) {
                                toast.success("This X.509 chain is valid and issuer CN match");
                                setTimeout(() => {
                                    nextStep();
                                }, 3000);
                            } else {
                                toast.error("This X.509 chain is invalid or issuer CN not match")
                                return;
                            }
                        }
                    } catch (error) {
                        toast.error("An error occurred");
                    }
                })();
            }
            setIsDone(true);
        }
    };

    useEffect(() => {
        if (!isDone && verifyButtonRef.current) {
            verifyButtonRef.current.click();
        }
    }, [isDone]);

    return (
        <>
            {isDone ?
                <Heading as="h1" size="md">
                    Now continue to verify the issuer address of the certificate chain
                </Heading> : <Heading as="h1" size="md">
                    Verifying validity of certificate chain and CN field
                </Heading>}
            <VStack spacing={10}>
                {issuerCN && (
                    <>
                        <List spacing={3}>
                            <ListItem>
                                <ListIcon as={FaUniversity} color="black.500"/>
                                Found Issuer CN: {issuerCN}
                            </ListItem>
                        </List>
                    </>)}
                <Button
                    ref={verifyButtonRef}
                    colorScheme="blue"
                    variant="solid"
                    onClick={() => {
                        handleCheck();
                    }}
                    isDisabled={isDone}
                >
                    VERIFY
                </Button>
            </VStack>
        </>
    );
};

export default VerifyChainCN;
