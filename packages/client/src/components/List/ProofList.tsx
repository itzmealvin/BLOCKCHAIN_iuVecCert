import {
  Button,
  Flex,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import Confetti from "confetti-react";
import { Contract } from "ethers";
import { useEffect, useMemo, useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { toast } from "react-toastify";
import { Verifier } from "../../../../compiled/index.ts";
import { FileProof, FileResult, Proof } from "../../models/File.ts";
import {
  decodeChallenge,
  getContractInstance,
  provider,
} from "../../services/BlockchainService.ts";

interface Props {
  contract: Contract;
  fileResult: FileResult;
  handleClick: () => void;
}

const ProofList = ({ contract, fileResult, handleClick }: Props) => {
  const [proofData, setProofData] = useState<string[]>([]);
  const [isDone, setDone] = useState(false);
  const verifyContract = useMemo(
    () =>
      getContractInstance(
        "0x700AD4e9C64682562A0020ceF44C1A1440680519",
        Verifier.abi,
        provider,
      ),
    [],
  );

  useEffect(() => {
    const verifyProof = async (fileProof: FileProof, name: string) => {
      try {
        const proofData: string[] = [];
        const pointsChallenges: (Proof | undefined)[] = [];
        const verifyChallengesResult: (boolean | undefined)[] = [];
        const verifyPointsResult: (boolean | undefined)[] = [];

        const layerChallenges = await Promise.all(
          fileProof.indices.map((index) =>
            index >= 0 ? contract.getChallengeAtIndex(index) : undefined
          ),
        );
        const decodedChallenges = layerChallenges.map((challenge) =>
          challenge ? decodeChallenge(challenge) : undefined
        );
        for (const challenge of decodedChallenges) {
          if (challenge) {
            try {
              const result = await verifyContract.verify(
                challenge.commitment,
                challenge.proof,
                challenge.index,
                challenge.value,
              );
              verifyChallengesResult.push(result);
            } catch (error) {
              console.error("Verification failed for a challenge:", error);
              verifyChallengesResult.push(undefined);
            }
          } else {
            verifyChallengesResult.push(undefined);
          }
        }

        if (
          verifyChallengesResult[0] &&
          fileProof.layer2Point &&
          fileProof.rootPoint &&
          decodedChallenges[0]?.commitment &&
          decodedChallenges[1]?.commitment &&
          decodedChallenges[2]?.commitment
        ) {
          proofData.push(`${name}/Layer 3 Challenge`);
          proofData.push(`${name}/Layer 2 Challenge`);
          proofData.push(`${name}/Root Challenge`);
          pointsChallenges.push(
            {
              ...fileProof.truePoint,
              commitment: decodedChallenges[0].commitment,
            },
            {
              ...fileProof.layer2Point,
              commitment: decodedChallenges[1].commitment,
            },
            {
              ...fileProof.rootPoint,
              commitment: decodedChallenges[2].commitment,
            },
          );
        } else if (
          verifyChallengesResult[1] &&
          fileProof.rootPoint &&
          decodedChallenges[1]?.commitment &&
          decodedChallenges[2]?.commitment
        ) {
          proofData.push(`${name}/Layer 2 Challenge`);
          proofData.push(`${name}/Root Challenge`);
          pointsChallenges.push(
            undefined,
            {
              ...fileProof.truePoint,
              commitment: decodedChallenges[1].commitment,
            },
            {
              ...fileProof.rootPoint,
              commitment: decodedChallenges[2].commitment,
            },
          );
        } else if (
          verifyChallengesResult[2] &&
          decodedChallenges[2]?.commitment
        ) {
          proofData.push(`${name}/Root Challenge`);
          pointsChallenges.push(undefined, undefined, {
            ...fileProof.truePoint,
            commitment: decodedChallenges[2].commitment,
          });
        }
        setProofData((prevProofData) =>
          [...prevProofData, ...proofData].filter(
            (item, index, self) => self.indexOf(item) === index,
          )
        );

        for (const point of pointsChallenges) {
          if (point) {
            try {
              const result = await verifyContract.verify(
                point.commitment,
                point.proof,
                point.index,
                point.value,
              );
              verifyPointsResult.push(result);
            } catch (error) {
              console.error("Verification failed for a challenge:", error);
              verifyPointsResult.push(undefined);
            }
          } else {
            verifyPointsResult.push(undefined);
          }
        }

        if (verifyPointsResult[0]) {
          proofData.push(`${name}/Layer 3 (leaf) Point`);
          proofData.push(`${name}/Layer 2 Point`);
          proofData.push(`${name}/Root Point`);
        } else if (verifyChallengesResult[1]) {
          proofData.push(`${name}/Layer 2 (leaf) Point`);
          proofData.push(`${name}/Root Point`);
        } else if (verifyChallengesResult[2]) {
          proofData.push(`${name}/Root (leaf) Point`);
        }
        setProofData((prevProofData) =>
          [...prevProofData, ...proofData].filter(
            (item, index, self) => self.indexOf(item) === index,
          )
        );
      } catch (error) {
        console.error(error);
        toast.error("IUVecCert Error: Can't verify the given PDF certificate");
      }
    };

    const performVerification = async () => {
      try {
        await verifyProof(
          fileResult.fileDetail.certFileProof,
          fileResult.fileDetail.certName,
        );
        await Promise.all(
          fileResult.fileDetail.appendixFileProofs.map((proof, index) =>
            verifyProof(proof, fileResult.fileDetail.appendixFiles[index])
          ),
        );

        setDone(true);
        toast.success("IUVecCert: Success verification");
      } catch (error) {
        console.error(error);
        toast.error(
          "IUVecCert Error: Can't verify the given PDF certificate/appendix(s)",
        );
      }
    };

    performVerification();
  }, [contract, fileResult, verifyContract]);

  return (
    <>
      <TableContainer>
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>Index</Th>
              <Th>File</Th>
              <Th>Location</Th>
              <Th>Result</Th>
            </Tr>
          </Thead>
          <Tbody>
            {proofData.map((data, index) => {
              return (
                <Tr>
                  <Td>{index + 1}</Td>
                  <Td>{data.split("/")[0]}</Td>
                  <Td>{data.split("/")[1]}</Td>
                  <Td bgColor="green.500" textStyle="bold">
                    <Flex align="center" gap="10px">
                      <FaCheckCircle />
                      PASS
                    </Flex>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </TableContainer>
      {isDone
        ? (
          <>
            <Confetti
              width={globalThis.innerWidth}
              height={globalThis.innerHeight}
            />
            <Button
              colorScheme="green"
              variant="solid"
              onClick={handleClick}
              mt={3}
              isDisabled={!isDone}
            >
              CONTINUE
            </Button>
          </>
        )
        : (
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="blue.500"
            size="md"
          />
        )}
    </>
  );
};

export default ProofList;
