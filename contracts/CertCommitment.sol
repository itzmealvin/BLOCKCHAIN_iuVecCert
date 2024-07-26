// SPDX-License-Identifier: MIT
// Modified from https://github.com/appliedzkp/semaphore/blob/master/contracts/sol/verifier.sol
pragma solidity ^0.8.0;

contract CertsCommitment {

    uint256 public issueTime;
    address public issuer;
    string public issuerCN;
    string public batchDesc;
    uint256[2] public commitment;
    uint256 public challengeIndex;
    uint256 public challengeValue;
    uint256[2] public challengeProof;
    mapping(string => bool) public isRevoked;

    modifier onlyIssuer() {
        require(msg.sender == issuer, "You are not the issuer!");
        _;
    }

    modifier isValid(string memory _hash) {
        require(
            isRevoked[_hash] != true,
            "This certificate is revoked and cannot be use!"
        );
        _;
    }

    constructor (
        string memory _issuerCN,
        string memory _batchDesc,
        uint256 _commitment0,
        uint256 _commitment1,
        uint256 _challengeIndex,
        uint256 _challengeValue,
        uint256 _challengeProof0,
        uint256 _challengeProof1
    ) {
        issueTime = block.timestamp;
        issuer = msg.sender;
        issuerCN = _issuerCN;
        batchDesc = _batchDesc;
        commitment[0] = _commitment0;
        commitment[1] = _commitment1;
        challengeIndex = _challengeIndex;
        challengeValue = _challengeValue;
        challengeProof[0] = _challengeProof0;
        challengeProof[1] = _challengeProof1;
    }

//    function getIssueTime() external view returns (uint256) {
//        return issueTime;
//    }
//
//    function getIssuer() external view returns (address) {
//        return issuer;
//    }
//
//    function getIssuerCN() external view returns (string memory) {
//        return issuerCN;
//    }
//
//    function getBatchDesc() external view returns (string memory) {
//        return batchDesc;
//    }
//
//    function getCommitment() external view returns (uint256[2] memory) {
//        return commitment;
//    }
//
//    function getChallenge() external view returns (uint256[2] memory) {
//        return [challengeIndex, challengeValue];
//    }
//
//    function getChallengeProof() external view returns (uint256[2] memory) {
//        return challengeProof;
//    }

    function revoke(string memory _hash) external onlyIssuer isValid(_hash) {
        isRevoked[_hash] = true;
    }
}
