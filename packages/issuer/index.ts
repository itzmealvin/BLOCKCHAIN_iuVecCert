import { InvalidArgumentError, program } from "commander";
import open from "open";
import type {
  DeploymentReceipt,
  SavedVectorCommitmentData,
  VectorCommitmentDeploymentRequest,
  VectorCommitmentDeploymentResponse,
} from "./models/VCDR.ts";
// @ts-types="@types/cors"
import cors from "cors";
// @ts-types="@types/express"
import express from "express";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";
import { extractAddress, verifyPermission } from "./helper/config.ts";
import { encodeChallenge } from "./helper/contract.ts";
import { buildVectorCommitment } from "./helper/creds.ts";
import {
  embedAndZip,
  formatToday,
  loadCertFolder,
  loadCertFolderFromSVCD,
  readBinAsJson,
  saveJsonAsBin,
  validateDeployment,
} from "./helper/sync.ts";
import { oraSpinner, waitForUserDecision } from "./libs/logger.ts";

program
  .name("iuveccert")
  .description(
    "IUVecCert ISSUER: CLI to issue embedded credentials securely by vector commitment",
  )
  .version("1.0.0");

program
  .command("build")
  .description(
    "Build Vector Commitment Deployment Request (VCDR) file for later deployment and Saved Vector Commitment Data (SVCD) for later embedment",
  )
  .option(
    "-p, --permission [file]",
    "input PDF permission file name",
    "issuerPermission.pdf",
  )
  .requiredOption(
    "-c, --cred <directory>",
    "input original PDF credential(s) directory path",
  )
  .option(
    "-i, --index <number>",
    "input index to slice the PDF credentials to be processed",
  )
  .requiredOption(
    "-d, --description <message>",
    "input CertCommitment smart contract description. Must be in the form [S{1-3}AY{2425}]",
  )
  .option(
    "-f, --fields [name...]",
    "the field(s) to be used as identifier for each PDF credential(s)",
    ["serial"],
  )
  .action(async (options) => {
    try {
      if (!options.permission.endsWith(".pdf")) {
        throw new InvalidArgumentError(
          "Input PDF permission file name must have a .pdf extension",
        );
      }

      const credDir = "./credentials/" + options.cred;

      if (!existsSync(options.permission) || !existsSync(credDir)) {
        throw new Error(
          "Either the input PDF permission file name or the input original PDF credential directory path does not exist",
        );
      }

      const parsedIndex = parseInt(options.index, 10);
      if (parsedIndex <= 2) {
        throw new InvalidArgumentError(
          "Input index must be a positive number greater than 2",
        );
      }

      const pattern = /^S([1-3])AY(\d{2})(\d{2})$/;
      const match = options.description.match(pattern);

      if (!match) {
        throw new InvalidArgumentError(
          "Description does not match the required form: [S{1-3}AY{2425}]",
        );
      }

      const firstTwoDigits = parseInt(match[2]);
      const lastTwoDigits = parseInt(match[3]);

      if (lastTwoDigits !== firstTwoDigits + 1) {
        throw new InvalidArgumentError(
          "Description does not match the required form: AY must runs before two consecutive two-digits number",
        );
      }

      const outputDir = "./requests/";

      if (!existsSync(outputDir)) {
        oraSpinner.start(`CREATING: Output directory at ${outputDir}`);
        mkdirSync(options.output, { recursive: true });
        oraSpinner.succeed(`CREATED: Output directory at ${outputDir}`);
      }

      oraSpinner.start(
        `READING: Input permission file from ${options.permission}`,
      );
      const permission = readFileSync(options.permission);
      oraSpinner.succeed(
        `READ: Input permission file from ${options.permission}`,
      );

      oraSpinner.start("VERIFYING: Permission data");
      const [issuerCN, issuerOG] = await verifyPermission(permission);
      oraSpinner.succeed(
        `VERIFIED: Permission data, ISSUER CN: ${issuerCN}, ISSUER OG: ${issuerOG}`,
      );

      oraSpinner.start("EXTRACTING: Issuer address");
      const grantedAddress = await extractAddress(permission);
      if (!grantedAddress) {
        throw new Error("No issuer address found in the PDF permission");
      }
      oraSpinner.succeed(`EXTRACTED: Granted address ${grantedAddress}`);

      const loader = await loadCertFolder(credDir, options.fields, parsedIndex);

      const vectorData = await buildVectorCommitment(loader.fileHashes);

      oraSpinner.start(
        "TRANSFORMING: Result challenge to smart contract parameters",
      );
      const challenge = encodeChallenge(vectorData.challenge);
      oraSpinner.succeed(
        "TRANSFORMED: Result challenge to smart contract parameters",
      );

      const currentDate = new Date();
      const timestamp = Math.floor(currentDate.getTime() / 1000);
      const outputVCDRFile = outputDir +
        `${timestamp}_${options.description}.vcdr`;
      oraSpinner.start(
        `SAVING: Vector Commitment Deployment Request (VCDR) file to ${outputVCDRFile}`,
      );
      const vcdr: VectorCommitmentDeploymentRequest = {
        issuerCN,
        issuerOG,
        description: options.description,
        challenge,
        grantedAddress,
        numberOfCreds: loader.fileHashes.length,
        lastModified: formatToday(currentDate),
        lastOperation: "built",
      };
      saveJsonAsBin(vcdr, outputVCDRFile);
      oraSpinner.succeed(
        `SAVED: Vector Commitment Deployment Request (VCDR) file to ${outputVCDRFile}`,
      );

      const outputSVCDFile = outputDir +
        `${timestamp}_${options.description}.svcd`;
      oraSpinner.start(
        `SAVING: Saved Vector Commitment Data (SVCD) file to ${outputSVCDFile}`,
      );
      const ommitedFileDetails = loader.fileDetails.map(
        // deno-lint-ignore no-unused-vars
        ({ credBuffer, appendixBuffers, ...rest }) => rest,
      );
      const svcd: SavedVectorCommitmentData = {
        vectorData,
        details: ommitedFileDetails,
        credDir,
      };
      saveJsonAsBin(svcd, outputSVCDFile);
      oraSpinner.succeed(
        `SAVED: Saved Vector Commitment Data (SVCD) file to ${outputSVCDFile}. Please keep this file safely and securely`,
      );
      Deno.exit(0);
    } catch (error: unknown) {
      if (error instanceof Error) {
        oraSpinner.fail(`IUVecCert ISSUER Error: ${error.message}`);
      }
      Deno.exit(1);
    }
  });

program
  .command("deploy")
  .description(
    "Deploy using Vector Commitment Deployment Request (VCDR) file for later embedment",
  )
  .requiredOption(
    "-v, --vcdr <file>",
    "input Vector Commitment Deployment Request (VCDR) file name",
  )
  .action(async (options) => {
    try {
      const app = express();
      app.use(cors());
      app.use(express.static("static"));
      app.use(express.json());
      app.listen(3000);

      const emojis = ["😀", "😂", "🎉", "✨", "🍕", "🚀", "🐱", "🐶", "🌟"];
      const randomEmojis = Array.from(
        { length: 4 },
        () => emojis[Math.floor(Math.random() * emojis.length)],
      );

      app.get("/auth", (_req, res) => {
        res.status(200).send(JSON.stringify(randomEmojis));
      });

      const vcdrFile = "./requests/" + options.vcdr;

      if (!vcdrFile.endsWith(".vcdr")) {
        throw new InvalidArgumentError(
          "Input Vector Commitment Deployment Request (VCDR) file name must have a .vcdr extension",
        );
      }

      if (!existsSync(vcdrFile)) {
        throw new Error("The input VCDR file name does not exist");
      }

      oraSpinner.start(`READING: Input VCDR file from ${vcdrFile}`);
      const vcdr = readBinAsJson(vcdrFile) as VectorCommitmentDeploymentRequest;
      oraSpinner.succeed(`READ: Input VCDR file from ${vcdrFile}`);

      if (vcdr.lastOperation !== "built") {
        oraSpinner.fail("CHECKED: This VCDR file has been deployed");
        await waitForUserDecision();
      }

      // deno-lint-ignore no-unused-vars
      const { challenge, ...logVCDR } = vcdr;
      console.log(logVCDR);
      await waitForUserDecision();

      app.get("/params", (_req, res) => {
        res.status(200).send({
          status: "sent",
          result: {
            issuerCN: vcdr.issuerCN,
            issuerOG: vcdr.issuerOG,
            description: vcdr.description,
            challenge: vcdr.challenge,
          },
        });
      });

      oraSpinner.info(
        `GUIDE: Please connect your wallet in the pop-up browser window.
         If it does not open automatically, click this link to open http://localhost:3000/index.html. 
         Proceed if the emojis match what you see on the browser window: ${
          randomEmojis.join(
            ", ",
          )
        }.`,
      );
      await open("http://localhost:3000/index.html");
      let walletAddress: string | undefined;
      let deploymentReceipt: DeploymentReceipt | undefined;
      app.post("/address", (req, res) => {
        const { type, address, receipt } = req.body;

        if (!type || (!address && !receipt) || (address && receipt)) {
          res
            .status(400)
            .send(
              "IUVecCert ISSUER Error: Missing type, and either address or receipt",
            );
        }

        if (type === "wallet") {
          walletAddress = address;

          oraSpinner.succeed(`RECEIVED: Wallet address ${walletAddress}`);
        } else if (type === "contract") {
          deploymentReceipt = receipt;

          oraSpinner.succeed("RECEIVED: Smart contract deployment receipt");
        } else {
          res.status(400).send("IUVecCert ISSUER Error: Invalid type");
        }
        res.status(200).send("IUVecCert ISSUER Info: Success");
      });

      oraSpinner.start(
        "GUIDE: Please return to the browser window to deploy smart contract",
      );

      let retries = 5;
      let maxRetries = retries;
      while (!walletAddress && retries > 0) {
        const attempt = maxRetries - retries + 1;
        oraSpinner.info(
          `GUIDE: Waiting for wallet address (Attempt: ${attempt}/${maxRetries})`,
        );
        if (retries > 1) {
          await new Promise((resolve) => setTimeout(resolve, 10000));
        }
        retries--;
      }
      if (!walletAddress) {
        throw new Error("Cannot retrieve the wallet address");
      }
      if (walletAddress !== vcdr.grantedAddress) {
        throw new Error("Wallet address and granted address does not match");
      }

      retries = 10;
      maxRetries = retries;
      while (!deploymentReceipt && retries > 0) {
        const attempt = maxRetries - retries + 1;
        oraSpinner.info(
          `GUIDE: Waiting for smart contract deployment receipt (Attempt: ${attempt}/${maxRetries})`,
        );
        if (retries > 1) {
          await new Promise((resolve) => setTimeout(resolve, 30000));
        }
        retries--;
      }
      if (!deploymentReceipt) {
        throw new Error(
          "Cannot retrieve the smart contract deployment receipt",
        );
      }

      oraSpinner.start(
        `APPENDING: Smart contract deployment receipt to ${vcdrFile}`,
      );

      const result: VectorCommitmentDeploymentResponse = {
        ...vcdr,
        deploymentReceipt,
        lastModified: formatToday(new Date()),
        lastOperation: "deployed",
      };

      saveJsonAsBin(result, vcdrFile);

      oraSpinner.succeed(
        `APPENDED: Smart contract deployment receipt to ${vcdrFile}`,
      );
      Deno.exit(0);
    } catch (error: unknown) {
      if (error instanceof Error) {
        oraSpinner.fail(`IUVecCert ISSUER Error: ${error.message}`);
      }
      Deno.exit(1);
    }
  });

program
  .command("embed")
  .description(
    "Embed credentials securely from a Vector Commitment Deployment Response (VCDRe) file and Saved Vector Commitment Data (SVCD)",
  )
  .option(
    "-p, --permission [file]",
    "input PDF permission file name",
    "issuerPermission.pdf",
  )
  .requiredOption(
    "-v, --vcdre <file>",
    "input Vector Commitment Deployment Response (VCDRe) file name",
  )
  .requiredOption(
    "-s, --svcd <file>",
    "input Saved Vector Commitment Data (SVCD) file name",
  )
  .option(
    "-o, --output [directory]",
    "output ZIP result directory path",
    "../../embedded/",
  )
  .option("-d, --delete", "delete the VCDRe and SVCD files for security", true)
  .action(async (options) => {
    try {
      if (!options.permission.endsWith(".pdf")) {
        throw new InvalidArgumentError(
          "Input PDF permission file name must have a .pdf extension",
        );
      }

      const vcdreFile = "./requests/" + options.vcdre;
      const svcdFile = "./requests/" + options.svcd;

      if (!vcdreFile.endsWith(".vcdr")) {
        throw new InvalidArgumentError(
          "Input Vector Commitment Deployment Response (VCDRe) file name must have a .vcdr extension",
        );
      }

      if (!svcdFile.endsWith(".svcd")) {
        throw new InvalidArgumentError(
          "Input saved Secret Verkle Data (SVCD) file name must have a .svcd extension",
        );
      }

      if (
        !existsSync(options.permission) ||
        !existsSync(vcdreFile) ||
        !existsSync(svcdFile)
      ) {
        throw new Error(
          "Either the input PDF permission file name, input VCDRe file name, or the input SVCD file name does not exist",
        );
      }

      if (!existsSync(options.output)) {
        oraSpinner.start(`CREATING: Output directory at ${options.output}`);
        mkdirSync(options.output, { recursive: true });
        oraSpinner.succeed(`CREATED: Output directory at ${options.output}`);
      }

      oraSpinner.start(
        `READING: Input permission file from ${options.permission}`,
      );
      const permission = readFileSync(options.permission);
      oraSpinner.succeed(
        `READ: Input permission file from ${options.permission}`,
      );

      oraSpinner.start("VERIFYING: Permission data");
      await verifyPermission(permission);
      oraSpinner.succeed("VERIFIED: Permission data");

      oraSpinner.start("EXTRACTING: Issuer address");
      const grantedAddress = await extractAddress(permission);
      if (!grantedAddress) {
        throw new Error("No issuer address found in the PDF permission");
      }
      oraSpinner.succeed(`EXTRACTED: Granted address ${grantedAddress}`);

      oraSpinner.start(`READING: Input VCDRe file from ${vcdreFile}`);
      const vcdre = readBinAsJson(
        vcdreFile,
      ) as VectorCommitmentDeploymentResponse;
      oraSpinner.succeed(`READ: Input VCDRe file from ${vcdreFile}`);

      if (vcdre.lastOperation !== "deployed" && !vcdre.deploymentReceipt) {
        throw new Error("This VCDRe file has not been deployed");
      }

      // deno-lint-ignore no-unused-vars
      const { challenge, deploymentReceipt, ...logVCDRE } = vcdre;
      console.log(logVCDRE);
      await waitForUserDecision();

      await validateDeployment(vcdre.deploymentReceipt, grantedAddress);

      oraSpinner.start(`READING: Input SVCD file from ${svcdFile}`);
      const svcd = readBinAsJson(svcdFile) as SavedVectorCommitmentData;
      oraSpinner.succeed(`READ: Input SVCD file from ${svcdFile}`);

      oraSpinner.start(
        `READING: PDF credential(s) from directory ${svcd.credDir} as group`,
      );
      const loader = loadCertFolderFromSVCD(svcd);
      oraSpinner.succeed(
        `READ: ${loader.length} PDF credential groups from directory ${svcd.credDir}`,
      );

      const zippedData = await embedAndZip(
        svcd.vectorData,
        loader,
        permission,
        vcdre.deploymentReceipt.contractAddress,
      );

      oraSpinner.start(
        `SAVING: Zipped ${loader.length} embedded PDF credential groups`,
      );
      const outputFile = resolve(
        options.output,
        `embedded_${loader.length}_${vcdre.deploymentReceipt.contractAddress}.zip`,
      );
      writeFileSync(outputFile, zippedData);
      oraSpinner.succeed(
        `SAVED: Zipped ${loader.length} embedded PDF credential groups to ${outputFile}`,
      );

      if (options.delete) {
        oraSpinner.start(
          "DELETING: Vector Commitment Deployment Response (VCDRe) file and Saved Vector Commitment Data (SVCD)",
        );
        unlinkSync(vcdreFile);
        unlinkSync(svcdFile);
        oraSpinner.succeed(
          "DELETED: Vector Commitment Deployment Response (VCDRe) file and Saved Vector Commitment Data (SVCD)",
        );
      }
      Deno.exit(0);
    } catch (error: unknown) {
      if (error instanceof Error) {
        oraSpinner.fail(`IUVecCert ISSUER Error: ${error.message}`);
      }
      Deno.exit(1);
    }
  });

program.parse();
