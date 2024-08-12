/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.20",
    settings: {
        optimizer: {
            enabled: true,
            runs: 200,
        },
    },
    paths: {
        sources: "./contracts",
        artifacts: "./src/compiled",
        cache: "./src/compiled",
    },
};
