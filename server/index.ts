import cors from "cors";
import express from "express";
import fs from "fs";
import os from "os";
import path from "path";
import { Worker } from "worker_threads";
import ChallengeDto from "./dtos/ChallengeDto";
import { FileParamsDto } from "./dtos/FileParamsDto";
import ProofsDto from "./dtos/ProofsDto";
import ValuesDto from "./dtos/ValuesDto";
import {
  commit,
  evaluateAt,
  genCoefficients,
  genProof,
  verify,
} from "./libs/lib-kzg";

const app = express();
const port = 8000;
const CONCURRENT_WORKER = os.cpus().length;

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.post("/coefficients", (req, res) => {
  try {
    console.log("Receive request to calculate Coefficients! Processing...");
    const { values } = req.body as ValuesDto;
    if (!Array.isArray(values)) {
      console.log("BAD REQUEST! Stopping...");
      res.status(400).send("Invalid values provided!");
      return;
    }
    const results = genCoefficients(values.map(BigInt));
    console.log("Request processed! Sending result...");
    res.status(200).json({ values: results.map(String) });
  } catch (error) {
    console.error(`Error occurred: ${error}. Stopping...`);
    res.status(500).send("An unknown error occurred!");
  }
});

app.post("/commitment", (req, res) => {
  try {
    console.log("Receive request to calculate Commitment! Processing...");
    const { values } = req.body as ValuesDto;
    if (!Array.isArray(values)) {
      console.log("BAD REQUEST! Stopping...");
      res.status(400).send("Invalid values provided!");
      return;
    }
    const results = commit(values.map(BigInt));
    console.log("Request processed! Sending result...");
    res.status(200).json({ values: results.map(String) });
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
    const workerPromises = chunks.map((chunk, i) => {
      return new Promise<void>((resolve) => {
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
      });
    });
    Promise.all(workerPromises)
      .then(() => {
        console.log("Request processed! Sending result...");
        return res.status(200).json(resultProofs);
      })
      .catch((error) => {
        console.error(`Error occurred: ${error}. Stopping...`);
        return res.status(500).send("An unknown error occurred!");
      });
  } catch (error) {
    console.error(`Error occurred: ${error}. Stopping...`);
    res.status(500).send("An unknown error occurred!");
  }
});

const readCoefficient = (commitHash: string): string[] | undefined => {
  try {
    const coefficientsFilename = `coefficients_${commitHash}.json`;
    const coefficientsFilePath = path.join(
      __dirname,
      "coefficients",
      coefficientsFilename,
    );
    const coefficientsJson = fs.readFileSync(coefficientsFilePath, "utf-8");
    const { calculatedCoeffs } = JSON.parse(coefficientsJson);
    return calculatedCoeffs;
  } catch (error) {
    console.error(`Error occurred: ${error}. Stopping...`);
    return;
  }
};

app.post("/verify", (req, res) => {
  try {
    console.log(
      "Receive request to verify the Coefficients using random number! Processing...",
    );
    const { commit, value, commitHash } = req.body as ChallengeDto;
    const coeffsString = readCoefficient(commitHash);
    if (!coeffsString) {
      console.log("BAD REQUEST! Stopping...");
      res.status(400).send("Invalid challenge provided!");
      return;
    }
    const coeffs = coeffsString!.map(BigInt);
    const xVal = BigInt(value);
    const proof = genProof(coeffs, xVal);
    const yVal = evaluateAt(coeffs, xVal);
    const commitment = commit.map(BigInt);
    const result = { challengeResult: verify(commitment, proof, xVal, yVal) };
    console.log(`Sent challenge:
    x-value: ${xVal}
    commitHash: ${commitHash}
    calculated y-value: ${yVal}
    ${result}
    `);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).send("An unknown error occurred!");
  }
});

app.post("/verifyRandom", (req, res) => {
  try {
    console.log(
      "Receive request to verify the Coefficients using random number! Processing...",
    );
    const { commit, value, commitHash } = req.body as ChallengeDto;
    const coeffsString = readCoefficient(commitHash);
    if (!coeffsString) {
      console.log("BAD REQUEST! Stopping...");
      res.status(400).send("Invalid challenge provided!");
      return;
    }
    const coeffs = coeffsString!.map(BigInt);
    const xVal = BigInt(value);
    const proof = genProof(coeffs, xVal);
    const yVal = evaluateAt(coeffs, xVal);
    const commitment = commit.map(BigInt);
    const result = { challengeResult: verify(commitment, proof, xVal, yVal) };
    console.log(`
    -----
    Challenge response:
      x-value: ${xVal}
      commitHash: ${commitHash}
      calculated y-value: ${yVal}
      ${result}
    -----
    `);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).send("An unknown error occurred!");
  }
});

app.listen(port, () =>
  console.log(`Server is listening at http://localhost:${port}`),
);
