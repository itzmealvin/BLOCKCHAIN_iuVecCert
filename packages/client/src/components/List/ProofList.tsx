import {
  Button,
  Flex,
  Link,
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
import { useEffect, useMemo, useRef, useState } from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import { toast } from "react-toastify";
import { Verifier } from "../../../../compiled/index.ts";
import { FileResult } from "../../models/File.ts";
import {
  decodeChallenge,
  getContractInstance,
  provider,
} from "../../services/BlockchainService.ts";

interface ProofItem {
  label: string;
  status: boolean;
}

interface Props {
  contract: Contract;
  fileResult: FileResult;
  handleClick: () => void;
}

const ProofList = ({ contract, fileResult, handleClick }: Props) => {
  const [proofData, setProofData] = useState<ProofItem[]>([]);
  const [isDone, setDone] = useState(false);
  const [isValid, setValid] = useState(false);

  const hasRun = useRef(false);

  const verifyContract = useMemo(
    () =>
      getContractInstance(
        "0xF98cbFAf6C804cD3928d4B575C050B1E72314c3D",
        Verifier.abi,
        provider,
      ),
    [],
  );

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const verifyOne = async (
      label: string,
      args: {
        commitment: string[];
        proof: string[];
        index: string;
        value: string;
      },
    ): Promise<{ label: string; status: boolean }> => {
      try {
        const status = await verifyContract.verify(
          args.commitment,
          args.proof,
          args.index,
          args.value,
        );
        if (!status) {
          throw new Error("IUVecCert+: On-chain verifier returned false");
        }
        return { label, status };
      } catch {
        return { label, status: false };
      }
    };

    const performVerification = async () => {
      try {
        const rawRoot = await contract.getRootChallenge();
        const decoded = decodeChallenge(rawRoot);

        const labels: string[] = [];
        const jobs: Promise<{ label: string; status: boolean }>[] = [];

        {
          labels.push("/Root Challenge");
          jobs.push(
            verifyOne("/Root Challenge", {
              commitment: decoded.commitment,
              proof: decoded.proof,
              index: decoded.index,
              value: decoded.value,
            }),
          );
        }

        {
          const credProof = fileResult.fileDetail.credFileProof;
          const leafLabel = `${fileResult.fileDetail.credName}/Leaf Point`;
          labels.push(leafLabel);
          jobs.push(
            verifyOne(leafLabel, {
              commitment: decoded.commitment,
              proof: credProof.proof,
              index: credProof.index,
              value: credProof.value,
            }),
          );
        }

        fileResult.fileDetail.appendixFileProofs.forEach((appendixProof, i) => {
          const name = fileResult.fileDetail.appendixFiles[i];
          const lbl = `${name}/Leaf Point`;
          labels.push(lbl);
          jobs.push(
            verifyOne(lbl, {
              commitment: decoded.commitment,
              proof: appendixProof.proof,
              index: appendixProof.index,
              value: appendixProof.value,
            }),
          );
        });

        const results = await Promise.all(jobs);
        setProofData(results);

        const anyFail = results.some((r) => !r.status);
        if (anyFail) {
          toast.error(
            "IU-VecCert+: Some proofs failed verification. Check the result table for details",
          );
          setValid(false);
        } else {
          toast.success("IU-VecCert+: Success verification");
          setValid(true);
        }
        setDone(true);
      } catch {
        toast.error(
          "IU-VecCert+ Error: Can't verify the given PDF credential/appendix(s)",
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
                  <Td>{data.label.split("/")[0]}</Td>
                  <Td>{data.label.split("/")[1]}</Td>
                  {data.status
                    ? (
                      <Td bgColor="green.500" textStyle="bold">
                        <Flex align="center" gap="10px">
                          <FaCheckCircle />
                          PASS
                        </Flex>
                      </Td>
                    )
                    : (
                      <Td bgColor="red.500" textStyle="bold">
                        <Flex align="center" gap="10px">
                          <FaTimesCircle />
                          FAIL
                        </Flex>
                      </Td>
                    )}
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </TableContainer>
      {isDone
        ? (
          isValid
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
              <Button
                colorScheme="red"
                variant="solid"
                onClick={handleClick}
                mt={3}
                isDisabled={!isDone}
              >
                <Link as={NavLink} to="/" _hover={{ textDecoration: "none" }}>
                  Return to Homepage
                </Link>
              </Button>
            )
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
