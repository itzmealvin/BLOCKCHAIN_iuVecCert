import cors from "cors";
import express from "express";
import os from "os";
import { Worker } from "worker_threads";
import  FileParamsDto  from "./dtos/FileParamsDto";
import ProofsDto from "./dtos/ProofsDto";
import ValuesDto from "./dtos/ValuesDto";
import { commit, evaluateAt, genCoefficients, genProof, genVerifierContractParams } from "./libs/lib-kzg";
import crypto from "crypto";
import ProgressBar from "progress";
import measureExecutionTime from "./libs/measureTime";

const app = express();
const port = 8000;
const CONCURRENT_WORKER = os.cpus().length;

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.post("/coefficients", async (req, res) => {
  try {
    console.log(
      "COEFFS: Received request to calculate Coefficients! Processing...",
    );
    const { values } = req.body as ValuesDto;
    if (!Array.isArray(values)) {
      console.log("COEFFS: BAD REQUEST! Stopping...");
      res.status(400).send("COEFFS: Invalid values provided!");
      return;
    }
    const { result: results, timeTaken } = await measureExecutionTime(() =>
      genCoefficients(values.map(BigInt)),
    );
    console.log(
      `COEFFS: Calculated ${values.length} value(s) in ${timeTaken}ms`,
    );
    console.log("COEFFS: Sending Coefficient(s) result...");
    res.status(200).json({ values: results.map(String) });
  } catch (error) {
    console.error(`COEFFS: Error occurred: ${error}. Stopping...`);
    res.status(500).send("COEFFS: An unknown error occurred!");
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
    console.log(
      "COMMIT: Received request to generate Commitment! Processing...",
    );
    const { values } = req.body as ValuesDto;
    if (!Array.isArray(values)) {
      console.log("COMMIT: BAD REQUEST! Stopping...");
      res.status(400).send("COMMIT: Invalid coefficient(s) provided!");
      return;
    }
    const bigIntCoeffs = values.map(BigInt);
    const n = 1;
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
    console.log(
      `COMMIT: Processed ${values.length} coefficient(s) and generated challenge suite in ${timeTaken}ms`,
    );
    console.log("COMMIT: Sending Commitment and Challenge suite result...");
    res.status(200).json(results);
  } catch (error) {
    console.error(`COMMIT: Error occurred: ${error}. Stopping...`);
    res.status(500).send("COMMIT: An unknown error occurred!");
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

const chunkify = <T>(array: T[], chunkSize: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

// @ts-ignore
app.post("/proof", async (req, res) => {
  try {
    console.log(
      "PROOFS: Received request to generate Proof! May take a long time to process..."
    );
    const { coeffs, files, commit } = req.body as ProofsDto;
    if (
      !Array.isArray(coeffs) ||
      !Array.isArray(commit) ||
      !Array.isArray(files) ||
      files.some((file) => file.fileProof.length !== 0)
    ) {
      console.log("PROOF: BAD REQUEST! Stopping...");
      res.status(400).send("PROOF: Invalid parameter(s) provided!");
      return;
    }

    const bigIntCoeffs = coeffs.map(BigInt);
    const bigIntCommit = commit.map(BigInt);
    const chunkSize = Math.ceil(files.length / (CONCURRENT_WORKER * 2));
    const chunks = chunkify(files, chunkSize);
    console.log(
      `PROOFS: Will split ${files.length} file(s) into ${chunkSize} file(s) * ${chunks.length} chunks`
    );
    const resultProofs: ProofsDto = {
      coeffs: coeffs,
      files: [],
      commit: commit,
    };

    const progressBar = new ProgressBar(
      "PROOF: Processing [:bar] :current/:total chunks (:percent)\n",
      {
        complete: "=",
        incomplete: "-",
        width: 30,
        total: chunks.length,
      }
    );

    progressBar.render();

    const processChunks = async (chunks: FileParamsDto[][]) => {
      for (const [chunkIndex, chunk] of chunks.entries()) {
        await Promise.all(
          chunk.map(
            (subChunk, subIndex) =>
              new Promise<void>((resolve, reject) => {
                const workerIndex = subIndex % CONCURRENT_WORKER;
                const worker = new Worker("./server/workers/worker.js", {
                  workerData: {
                    coeffs: bigIntCoeffs,
                    chunks: subChunk,
                    commit: bigIntCommit,
                    path: "./ProofWorker.ts",
                  },
                });
                worker.on("message", (message) => {
                  console.log(
                    `3 PROOFS: Worker ${workerIndex} completed sub-chunk ${
                      subIndex + 1
                    }/${chunk.length} of chunk ${chunkIndex + 1}: ${message}`
                  );
                    message.forEach((file: FileParamsDto) => {
                      resultProofs.files.push(file);
                    });
                    resolve();
                });
                worker.on("error", (error) => {
                  console.log(
                    `PROOFS: Worker ${workerIndex} encountered an error on sub-chunk ${
                      subIndex + 1
                    }/${chunk.length} of chunk ${chunkIndex + 1}`
                  );
                  reject(error);
                });
                worker.on("exit", (code) => {
                  if (code !== 0) {
                    reject(
                      new Error(
                        `PROOFS: Worker ${workerIndex} stopped with exit code ${code} on sub-chunk ${
                          subIndex + 1
                        }/${chunk.length} of chunk ${chunkIndex + 1}`
                      )
                    );
                  }
                });
              })
          )
        );
        progressBar.tick();
      }
    };

    const { timeTaken } = await measureExecutionTime(() => processChunks(chunks));
    console.log(
      `PROOFS: Generated ${coeffs.length} proof(s) in ${timeTaken}ms`
    );
    console.log("PROOFS: Sending Proof results...");
    return res.status(200).json(resultProofs);
  } catch (error) {
    console.error(`PROOFS: Error occurred: ${error}. Stopping...`);
    res.status(500).send("PROOF: An unknown error occurred!");
  }
});

app.listen(port, () =>
  console.log(`SERVER: Server is listening at http://localhost:${port}`),
);