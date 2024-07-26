import cors from "cors";
import express from "express";
import os from "os";
import { Worker } from "worker_threads";
import { FileParamsDto } from "./dtos/FileParamsDto";
import ProofsDto from "./dtos/ProofsDto";
import ValuesDto from "./dtos/ValuesDto";
import { commit, evaluateAt, genCoefficients, genProof, genVerifierContractParams } from "./libs/lib-kzg";
import crypto from "crypto";

const app = express();
const port = 8000;
const CONCURRENT_WORKER = os.cpus().length;

app.use(cors());
app.use(express.json({ limit: "2mb" }));

const measureExecutionTime = async <T>(
  func: () => Promise<T> | T,
): Promise<{ result: T; timeTaken: number }> => {
  const startTime = Date.now();
  const result = await func();
  const endTime = Date.now();
  return {
    result,
    timeTaken: endTime - startTime,
  };
};

app.post("/coefficients", async (req, res) => {
  try {
    console.log("Receive request to calculate Coefficients! Processing...");
    const { values } = req.body as ValuesDto;
    if (!Array.isArray(values)) {
      console.log("BAD REQUEST! Stopping...");
      res.status(400).send("Invalid values provided!");
      return;
    }
    const { result: results, timeTaken } = await measureExecutionTime(() =>
      genCoefficients(values.map(BigInt)),
    );
    console.log(`Time taken to process request: ${timeTaken}ms`);
    console.log("Request processed! Sending result...");
    res.status(200).json({ values: results.map(String) });
  } catch (error) {
    console.error(`Error occurred: ${error}. Stopping...`);
    res.status(500).send("An unknown error occurred!");
  }
});

const pickRandomValues = (values: bigint[], n: number): bigint[] => {
  const shuffled = values.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
};

const genChallengeValue = (
  commitment: bigint[],
  randomValues: bigint[],
): bigint => {
  const hash = crypto.createHash("sha256");
  hash.update(commitment.join(""));
  randomValues.forEach((value) => hash.update(value.toString()));
  return BigInt("0x" + hash.digest("hex"));
};

app.post("/commitment", async (req, res) => {
  try {
    console.log("Receive request to calculate Commitment! Processing...");
    const { values } = req.body as ValuesDto;
    if (!Array.isArray(values)) {
      console.log("BAD REQUEST! Stopping...");
      res.status(400).send("Invalid values provided!");
      return;
    }
    const bigIntCoeffs = values.map(BigInt);
    const n = 4;
    const randomValues = pickRandomValues(bigIntCoeffs, n);

    const { result: results, timeTaken } = await measureExecutionTime(() => {
      const commitment = commit(bigIntCoeffs);
      const challengeIndex = genChallengeValue(commitment, randomValues);
      const challengeValue = evaluateAt(bigIntCoeffs, challengeIndex);
      const proof = genProof(bigIntCoeffs, challengeIndex);
      const params = genVerifierContractParams(
        commitment,
        proof,
        challengeIndex,
        challengeValue,
      );
      return { values: commitment.map(String), challenge: params };
    });
    console.log(`Time taken to process request: ${timeTaken}ms`);
    console.log("Request processed! Sending result...");
    res.status(200).json(results);
  } catch (error) {
    console.error(`Error occurred: ${error}. Stopping...`);
    res.status(500).send("An unknown error occurred!");
  }
});

// Working: Sequential Processing
// app.post("/proof", (req, res) => {
//   try {
//     const { coeffs, files } = req.body as ProofsDto;
//     const bigIntCoeffs = coeffs.map(BigInt);
//     const responseFiles = files.map((file, index) => {
//       console.log("Processing index: ", index);
//       const [r, s, recoveryParam]: bigint[] = genProof(
//         bigIntCoeffs,
//         file.fileIndex
//       );
//       return {
//         ...file,
//         fileProof: {
//           r: r.toString(),
//           s: s.toString(),
//           recoveryParam: recoveryParam.toString(),
//         },
//       };
//     });
//     return res.status(200).json({ coeffs: coeffs, files: responseFiles });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).send("An unknown error occurred!");
//   }
// });

const chunkify = <T>(array: T[], n_workers: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = n_workers; i > 0; i--) {
    chunks.push(array.splice(0, Math.ceil(array.length / i)));
  }
  return chunks;
};

// @ts-ignore
app.post("/proof", async (req, res) => {
  try {
    console.log(
      "Receive request to calculate Proof! May take a long time to processing...",
    );
    const { coeffs, files, commit } = req.body as ProofsDto;
    if (
      !Array.isArray(coeffs) ||
      !Array.isArray(commit) ||
      !Array.isArray(files) ||
      files.some((file) => file.fileProof.length !== 0)
    ) {
      console.log("BAD REQUEST! Stopping...");
      res.status(400).send("Invalid values provided!");
      return;
    }

    const bigIntCoeffs = coeffs.map(BigInt);
    const bigIntCommit = commit.map(BigInt);
    const chunks = chunkify(files, CONCURRENT_WORKER);
    const resultProofs: ProofsDto = {
      coeffs: coeffs,
      files: [],
      commit: commit,
    };

    const processChunks = async () => {
      const workerPromises = chunks.map((chunk, i) => {
        return new Promise<void>((resolve, reject) => {
          // Added reject to handle errors
          const worker = new Worker("./server/workers/worker.js", {
            workerData: {
              coeffs: bigIntCoeffs,
              chunks: chunk,
              commit: bigIntCommit,
              path: "./ProofWorker.ts",
            },
          });
          worker.on("message", (resultFiles) => {
            console.log(`Worker ${i} completed!`);
            resultFiles.forEach((file: FileParamsDto) =>
              resultProofs.files.push(file),
            );
            resolve();
          });
          worker.on("error", reject);
          worker.on("exit", (code) => {
            if (code !== 0) {
              reject(new Error(`Worker stopped with exit code ${code}`));
            }
          });
        });
      });
      return Promise.all(workerPromises);
    };

    const { timeTaken } = await measureExecutionTime(processChunks);

    console.log(`Time taken to process request: ${timeTaken}ms`);
    console.log("Request processed! Sending result...");
    return res.status(200).json(resultProofs);
  } catch (error) {
    console.error(`Error occurred: ${error}. Stopping...`);
    res.status(500).send("An unknown error occurred!");
  }
});

app.listen(port, () =>
  console.log(`Server is listening at http://localhost:${port}`),
);
