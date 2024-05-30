// SPDX-License-Identifier: MIT
// Modified from https://github.com/appliedzkp/semaphore/blob/master/contracts/sol/verifier.sol
pragma solidity ^0.8.0;

contract CertsCommitment {
    address public publisher;
    uint256 public deploymentTime;
    string public publisherCN;
    string public batchDesc;
    Commitment public commitment;
    mapping(string => bool) public isRevoked;

    struct Commitment {
        string _r;
        string _s;
        string _recoverParam;
    }

    modifier onlyPublisher() {
        require(msg.sender == publisher, "You are not the publisher!");
        _;
    }

    modifier isValid(string memory _hash) {
        require(
            isRevoked[_hash] != true,
            "This certificate is revoked and cannot be use!"
        );
        _;
    }

    constructor(
        string memory _publisherCN,
        string memory _batchDesc,
        string memory _r,
        string memory _s,
        string memory _recoverParam
    ) {
        deploymentTime = block.timestamp;
        publisher = msg.sender;
        publisherCN = _publisherCN;
        batchDesc = _batchDesc;
        commitment = Commitment(_r, _s, _recoverParam);
    }

    function revoke(string memory _hash) external onlyPublisher isValid(_hash) {
        isRevoked[_hash] = true;
    }
}
