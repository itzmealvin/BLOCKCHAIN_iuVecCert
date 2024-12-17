import CredsCommitment from "./CredsCommitment.json" with { type: "json" };
import { ethers } from "./ethers.min.js";

const tooltipTriggerList = document.querySelectorAll(
  '[data-bs-toggle="tooltip"]',
);
const _tooltipList = [...tooltipTriggerList].map((tooltipTriggerEl) =>
  new bootstrap.Tooltip(tooltipTriggerEl)
);

const spinner = document.getElementById("spinner");
const appStatus = document.getElementById("appStatus");

const connectWalletButton = document.getElementById("connectWalletButton");
const walletStatus = document.getElementById("walletStatus");

const deployContractButton = document.getElementById("deployContractButton");
const contractStatus = document.getElementById("contractStatus");
const emojiStatus = document.getElementById("emojiStatus");

try {
  const response = await fetch("http://localhost:3000/auth");
  if (response.ok) {
    const emojis = await response.json();
    emojiStatus.textContent = emojis.join("   ");
  }
} catch (error) {
  appStatus.textContent = `Failed to fetch the emojis. Error message: ${
    truncatedMessage(error.message)
  }`;
  appStatus.style.color = "#dc3545";
}

let parameters = {};
let provider;
let signer;

/**
 * Truncate error message (if too long)
 * @param errorMessage The error message to be truncated
 * @returns {string|*} The truncated error message
 */
function truncatedMessage(errorMessage) {
  const MAX_LENGTH = 50;
  return errorMessage.length > MAX_LENGTH
    ? `${errorMessage.substring(0, MAX_LENGTH)}...`
    : errorMessage;
}

connectWalletButton.addEventListener("click", async () => {
  appStatus.style.removeProperty("color");
  if (globalThis.ethereum) {
    try {
      provider = new ethers.BrowserProvider(globalThis.ethereum);
      let networkConfiguration = await provider.getNetwork();
      if (networkConfiguration.chainId !== 11155111) {
        await globalThis.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [
            {
              chainId: "0xaa36a7",
            },
          ],
        });
        provider = new ethers.BrowserProvider(globalThis.ethereum);
        networkConfiguration = await provider.getNetwork();
      }
      signer = await provider.getSigner();
      const response = await fetch("http://localhost:3000/address", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type: "wallet", address: signer.address }),
      });
      if (response.ok) {
        spinner.classList.remove("d-none");
        appStatus.textContent = "Waiting for smart contract parameters...";
        connectWalletButton.classList.add("d-none");
        walletStatus.textContent =
          `You are connected as ${signer.address} on ${networkConfiguration.name.toUpperCase()} network (Chain ID: ${networkConfiguration.chainId})`;
        walletStatus.style.color = "#198754";
        deployContractButton.classList.remove("d-none");
        pollForResult();
      }
    } catch (error) {
      console.log(error);
      appStatus.textContent = `Failed to connect wallet. Error message: ${
        truncatedMessage(error.message)
      }`;
      appStatus.style.color = "#dc3545";
    }
  } else {
    appStatus.innerHTML =
      'EVM Wallet not detected. Get one at <a href="https://metamask.io/" target="_blank" rel="noopener noreferrer">MetaMask.io</a>';
    appStatus.style.color = "#ffc107";
  }
});

/**
 * Poll the contract parameters to be deployed
 */
function pollForResult() {
  const interval = setInterval(
    async () => {
      try {
        const response = await fetch("http://localhost:3000/params");
        if (response.ok) {
          clearInterval(interval);
          parameters = await response.json();
          spinner.classList.add("d-none");
          appStatus.textContent = "Deploy the CredsCommitment contract now";
          deployContractButton.disabled = false;
        }
      } catch (error) {
        appStatus.textContent =
          `Failed to fetch the parameters. Error message: ${
            truncatedMessage(error.message)
          }`;
        appStatus.style.color = "#dc3545";
      }
    },
    5 * 1000,
  );
}

deployContractButton.addEventListener("click", async () => {
  appStatus.style.removeProperty("color");
  try {
    spinner.classList.remove("d-none");
    appStatus.textContent = "Deploying your CredsCommitment contract";
    deployContractButton.disabled = true;

    const challenge = parameters.result.challenge;

    const contractFactory = new ethers.ContractFactory(
      CredsCommitment.abi,
      CredsCommitment.bytecode,
      signer,
    );
    const contractInstance = await contractFactory.deploy(
      parameters.result.issuerCN,
      parameters.result.description,
      challenge,
    );

    const deployedContract = await contractInstance.deploymentTransaction()
      .wait(1); // 1 is number of confirmation needed

    const txnReceipt = await deployedContract.getTransaction();
    const contractAddress = deployedContract.contractAddress;

    const receipt = {
      from: txnReceipt.from,
      nonce: txnReceipt.nonce,
      blockNumber: txnReceipt.blockNumber,
      blockTimestamp: (await provider.getBlock(txnReceipt.blockNumber)).date,
      status: deployedContract.status,
      confirmations: await txnReceipt.confirmations(),
      contractAddress,
    };

    const response = await fetch("http://localhost:3000/address", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "contract",
        receipt,
      }),
    });

    if (response.ok) {
      spinner.classList.add("d-none");
      appStatus.textContent =
        "Smart contract CredsCommitment deployed successfully. You can safely close this window";
      deployContractButton.classList.add("d-none");
      contractStatus.style.color = "#198754";
      contractStatus.innerHTML =
        `<a href="https://sepolia.etherscan.io/tx/${contractInstance.deploymentTransaction().hash}" target="_blank" rel="noopener noreferrer">View on explorer</a>`;
    }
  } catch (error) {
    console.log(error);
    spinner.classList.add("d-none");
    appStatus.textContent =
      `Failed to deploy CredsCommitment contract. Error message: ${
        truncatedMessage(error.message)
      }`;
    appStatus.style.color = "#dc3545";
    deployContractButton.disabled = false;
  }
});
