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
import { FileResult, Proof } from "../../models/File.ts";
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
        "0x56B6DE2Aefa9463413d547E1bcE9271948e321B2",
        Verifier.abi,
        provider,
      ),
    [],
  );

  useEffect(() => {
    const verifyProof = async (fileProof: Proof, name: string) => {
      try {
        const proofData: string[] = [];
        const verifyChallengesResult: (boolean | undefined)[] = [];
        const verifyPointsResult: (boolean | undefined)[] = [];

        const rootChallenge = await contract.getRootChallenge();
        const decodedChallenge = decodeChallenge(rootChallenge);

        if (rootChallenge) {
          try {
            const result = await verifyContract.verify(
              rootChallenge.commitment,
              rootChallenge.proof,
              rootChallenge.index,
              rootChallenge.value,
            );
            verifyChallengesResult.push(result);
          } catch (error) {
            console.error("Verification failed for a challenge:", error);
            verifyChallengesResult.push(undefined);
          }
        }

        proofData.push(`${name}/Root Challenge`);
        setProofData((prevProofData) =>
          [...prevProofData, ...proofData].filter(
            (item, index, self) => self.indexOf(item) === index,
          )
        );

        const pointChallenge = {
          ...fileProof,
          commitment: decodedChallenge.commitment,
        };

        if (pointChallenge) {
          try {
            const result = await verifyContract.verify(
              pointChallenge.commitment,
              pointChallenge.proof,
              pointChallenge.index,
              pointChallenge.value,
            );
            verifyPointsResult.push(result);
          } catch (error) {
            console.error("Verification failed for a challenge:", error);
            verifyPointsResult.push(undefined);
          }
        }

        proofData.push(`${name}/Leaf Point`);
        setProofData((prevProofData) =>
          [...prevProofData, ...proofData].filter(
            (item, index, self) => self.indexOf(item) === index,
          )
        );
      } catch (error) {
        console.error(error);
        toast.error("IUVecCert Error: Can't verify the given PDF credential");
      }
    };

    const performVerification = async () => {
      try {
        await verifyProof(
          fileResult.fileDetail.credFileProof,
          fileResult.fileDetail.credName,
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
          "IUVecCert Error: Can't verify the given PDF credential/appendix(s)",
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
