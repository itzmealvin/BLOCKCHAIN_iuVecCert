import cors from "cors";
import crypto from "crypto";
import express from "express";
import os from "os";
import ProofsDto from "./dtos/ProofsDto";
import ValuesDto from "./dtos/ValuesDto";
import {commit, evaluateAt, genCoefficients, genProof, genVerifierContractParams} from "./libs/lib-kzg";
import measureExecutionTime from "./libs/measureTime";
import {Worker} from "worker_threads";

const app = express();
const port = 3000;
const CONCURRENT_WORKER = os.cpus().length * 2;

app.use(cors());
app.use(express.json({limit: "15mb"}));

app.post("/coefficients", async (req, res) => {
    try {
        console.log(
            "COEFFS: Received request to calculate Coefficients! Processing...",
        );
        const {values} = req.body as ValuesDto;
        if (!Array.isArray(values)) {
            console.log("COEFFS: BAD REQUEST! Stopping...");
            res.status(400).send("COEFFS: Invalid values provided!");
            return;
        }
        const {result: results, timeTaken} = await measureExecutionTime(() =>
            genCoefficients(values.map(BigInt)),
        );
        console.log(
            `COEFFS: Calculated ${values.length} value(s) in ${timeTaken}ms`,
        );
        console.log("COEFFS: Sending Coefficient(s) result...");
        res.status(200).json({values: results.map(String)});
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
    const hash = crypto.createHash("sha224");
    hash.update(commitment.join(""));
    randomValues.forEach((value) => hash.update(value.toString()));
    return BigInt("0x" + hash.digest("hex"));
};

app.post("/commitment", async (req, res) => {
    try {
        console.log(
            "COMMIT: Received request to generate Commitment! Processing...",
        );
        const {values} = req.body as ValuesDto;
        if (!Array.isArray(values)) {
            console.log("COMMIT: BAD REQUEST! Stopping...");
            res.status(400).send("COMMIT: Invalid coefficient(s) provided!");
            return;
        }
        const bigIntCoeffs = values.map(BigInt);
        const n = 1;
        const randomValues = pickRandomValues(bigIntCoeffs, n);

        const {result: results, timeTaken} = await measureExecutionTime(() => {
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
            return {values: commitment.map(String), challenge: params};
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
//     const { coeffs, files,commit } = req.body as ProofsDto;
//     const bigIntCoeffs = coeffs.map(BigInt);
//     const responseFiles = files.map((file, index) => {
//       console.log("Processing index: ", index);
//       const proof = genProof(bigIntCoeffs, parseInt(file.fileIndex));
//       const params = genVerifierContractParams(
//         commit,
//         proof,
//         parseInt(file.fileIndex),
//         BigInt(file.fileHash),
//       );
//       return {
//         fileIndex: params.index,
//         fileHash: params.value,
//         fileProof: params.proof
//       };
//     });
//     return res.status(200).json({ coeffs: coeffs, files: responseFiles });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).send("An unknown error occurred!");
//   }
// });

// @TODO: Optimize using SharedArrayBuffer
// @ts-ignore
app.post("/proof", async (req, res) => {
    try {
        console.log("PROOFS: Received request to generate Proof(s)! May take a long time to process...");
        const {coeffs, files, commit} = req.body as ProofsDto;

        if (!Array.isArray(coeffs) || !Array.isArray(commit) || !Array.isArray(files) || files.some((file) => file.fileProof.length !== 0)) {
            console.log("PROOFS: BAD REQUEST! Stopping...");
            res.status(400).send("PROOFS: Invalid parameter(s) provided!");
            return;
        }

        const bigIntCoeffs = coeffs.map(BigInt);
        const bigIntCommit = commit.map(BigInt);
        const indexSize = Math.ceil(files.length / CONCURRENT_WORKER);
        console.log(`PROOFS: Will split ${files.length} file(s) into ${indexSize} file(s) * ${CONCURRENT_WORKER} chunks!`);
        const chunks = Array.from({length: Math.ceil(files.length / indexSize)}, (_v, i) =>
            files.slice(i * indexSize, i * indexSize + indexSize),
        );
        const resultProofs: ProofsDto = {
            coeffs: [],
            files: [],
            commit: [],
        };
        const workerPromises = chunks.map((chunk, index) => {
            return new Promise<void>((resolve, reject) => {
                const worker = new Worker("./server/workers/workerWrapperOld.js", {
                    workerData: {
                        coeffs: bigIntCoeffs,
                        commit: bigIntCommit,
                        work: chunk,
                        worker: index,
                        path: "./workerOld.ts",
                    },
                });

                worker.on("message", (result) => {
                    resultProofs.files.push(...result);
                    resolve();
                });

                worker.on("error", (error) => {
                    console.log(`PROOFS: Worker ${index} encountered an ${error}!`);
                    reject(error);
                });

                worker.on("exit", (code) => {
                    if (code !== 0) {
                        reject(new Error(`PROOFS: Worker ${worker} stopped with exit code ${code}`!));
                    }
                });
            });
        });

        const {timeTaken} = await measureExecutionTime(() => Promise.all(workerPromises));
        resultProofs.files.sort((a, b) => parseInt(a.fileIndex) - parseInt(b.fileIndex));
        console.log(`PROOFS: Generated ${files.length} Proof(s) in ${timeTaken}ms`);
        console.log(`PROOFS: Sending Proof(s) result..."`);
        return res.status(200).json(resultProofs);

    } catch (error) {
        console.error(`PROOFS: Error occurred: ${error}. Stopping...`);
        res.status(500).send("PROOFS: An unknown error occurred!");
    }
});

// @TODO: Create a new version for Verkle tree implementation

app.listen(port, () =>
    console.log(`SERVER: Server is listening at http://localhost:${port}`),
);
