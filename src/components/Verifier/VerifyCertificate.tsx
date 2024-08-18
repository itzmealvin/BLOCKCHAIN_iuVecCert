import {Button, Heading, List, ListIcon, ListItem, VStack,} from "@chakra-ui/react";
import {useEffect, useRef, useState} from "react";
import {FaCertificate, FaCheckCircle, FaQuestionCircle} from "react-icons/fa";
import {JsonRpcProvider} from "ethers";
import useWeb3Store from "../../hooks/useWeb3Store";
import blockchainServices from "../../services/BlockchainServices";
import {CertCommitment, Verifier} from "../../compiled";
import {toast} from "react-toastify";
import useFilesStore from "../../hooks/useFilesStore";
import HelperService from "../../services/HelperService";
import {useVerifierStore} from "../../hooks/useStepsStores";

const VerifyIssuer = () => {
    const [commitment, setCommitment] = useState<string[]>([]);
    const [challenge, setChallenge] = useState<string[]>([]);
    const [challengeProof, setChallengeProof] = useState<string[]>([]);
    const provider = new JsonRpcProvider("https://rpc.sepolia.org", "sepolia");
    const {contractAddress} = useWeb3Store();
    const {filesProps} = useFilesStore();
    const {toggleDone, isDone} = useVerifierStore();
    const verifierAddress = "0x368C4EBFF1E39Fd405C4FD3FD779F8300C068032"
    const verifyButtonRef = useRef<HTMLButtonElement>(null);
    const hasClickedRef = useRef(false);

    const handleCheck = () => {
        const certContract = blockchainServices.getContract(contractAddress, CertCommitment.abi, provider);
        const verifyContract = blockchainServices.getContract(verifierAddress, Verifier.abi, provider);
        if (certContract && verifyContract) {
            (async () => {
                try {
                    const contractCommitment: BigInt[] = await certContract.getCommitment();
                    const contractChallengeIndex: BigInt = await certContract.challengeIndex();
                    const contractChallengeValue: BigInt = await certContract.challengeValue();
                    const contractChallengeProof: BigInt[] = await certContract.getChallengeProof();
                    const commitmentStrArray = contractCommitment.map(commit => `0x${commit.toString(16)}`);
                    const challengeIndexStr = `0x${contractChallengeIndex.toString(16)}`;
                    const challengeValueStr = `0x${contractChallengeValue.toString(16)}`;
                    const challengeProofStrArray = contractChallengeProof.map(proof => `0x${proof.toString(16)}`);
                    setCommitment(commitmentStrArray);
                    setChallenge([challengeIndexStr, challengeValueStr]);
                    setChallengeProof(challengeProofStrArray);
                    if (await verifyContract.verify(commitmentStrArray, challengeProofStrArray, challengeIndexStr, challengeValueStr)) {
                        if (await verifyContract.verify(commitmentStrArray, filesProps[0].fileProof, filesProps[0].fileIndex, filesProps[0].fileHash)) {
                            toast.success("This signature is valid and issuer match!");
                            if (!isDone) toggleDone();
                        } else {
                            toast.error("Certificate does not pass verification!");
                            return;
                        }
                    } else {
                        toast.error("Challenge does not pass verification failed!");
                        return;
                    }
                } catch (error) {
                    toast.error("An error occurred!");
                }
            })();
        }
    }

    useEffect(() => {
        if (!isDone && !hasClickedRef.current && verifyButtonRef.current) {
            verifyButtonRef.current.click();
            hasClickedRef.current = true;
        }
    }, [isDone]);

    return (
        <>
            {isDone ?
                <Heading as="h1" size="md">
                    GREAT! CERTIFICATE IS VALID
                </Heading> : <Heading as="h1" size="md">
                    Verifying validity the secured-generated challenge and certificate
                </Heading>}
            <VStack spacing={10}>
                {commitment.length !== 0 && challenge.length !== 0 && challengeProof.length !== 0 && (
                    <>
                        <List spacing={3}>
                            <ListItem>
                                <ListIcon as={FaCheckCircle} color="black.500"/>
                                Found Commitment:
                                ({HelperService.truncateString(commitment[0], 5)}, {HelperService.truncateString(commitment[1], 5)})
                            </ListItem>
                            <ListItem>
                                <ListIcon as={FaQuestionCircle} color="black.500"/>
                                Found Challenge:
                                ({HelperService.truncateString(challenge[0], 5)}, {HelperService.truncateString(challenge[1], 5)})
                            </ListItem>
                            <ListItem>
                                <ListIcon as={FaCertificate} color="black.500"/>
                                Found Challenge Proof:
                                ({HelperService.truncateString(challengeProof[0], 5)}, {HelperService.truncateString(challengeProof[1], 5)})
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

export default VerifyIssuer;
