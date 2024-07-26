// SPDX-License-Identifier: MIT
// Modified from https://github.com/appliedzkp/semaphore/blob/master/contracts/sol/verifier.sol
pragma solidity ^0.8.0;

contract CertsCommitment {
    address public publisher;
    uint256 public publishTime;
    string public publisherCN;
    string public batchDesc;
    string public challenge;
    Points public commitment;
    Points public challengeProof;
    mapping(string => bool) public isRevoked;

    struct Points {
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
        string memory _challenge,
        string memory _r1,
        string memory _s1,
        string memory _recoverParam1,
        string memory _r2,
        string memory _s2,
        string memory _recoverParam2
    ) {
        publishTime = block.timestamp;
        publisher = msg.sender;
        publisherCN = _publisherCN;
        challenge = _challenge;
        batchDesc = _batchDesc;
        commitment = Points(_r1, _s1, _recoverParam1);
        challengeProof = Points(_r2, _s2, _recoverParam2);
    }

    function revoke(string memory _hash) external onlyPublisher isValid(_hash) {
        isRevoked[_hash] = true;
    }
}
