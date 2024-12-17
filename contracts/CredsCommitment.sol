// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

/**
 * @title CredsCommitment
 * @author Quang-Dieu Nguyen
 * @notice Contract to manage challenge and revocation for credentials.
 */
contract CredsCommitment {
    // State variables
    uint256 public issueTime;
    address public issuer;
    string public issuerCN;
    string public batchDesc;

    // Structs
    struct GPoint {
        uint256 X;
        uint256 Y;
    }

    struct Challenge {
        uint256 index;
        uint256 value;
        GPoint proof;
        GPoint commitment;
    }

    struct Revoked {
        bool status;
        string reason;
    }

    Challenge public rootChallenge;
    mapping(string => Revoked) public isRevoked;

    // Modifiers
    /**
     * @notice Ensures only the issuer can execute certain functions.
     */
    modifier onlyIssuer() {
        require(
            msg.sender == issuer,
            "CredsCommitment: Caller is not the issuer"
        );
        _;
    }

    /**
     * @notice Ensures the credential is not revoked.
     */
    modifier isValid(string memory _hash) {
        require(
            !isRevoked[_hash].status,
            "CredsCommitment: Credential is revoked"
        );
        _;
    }

    // Constructor
    /**
     * @notice Initializes the contract with issuer information and pre-allocates challenge slots.
     * @param _issuerCN Common name of the issuer.
     * @param _batchDesc Description of the credential batch.
     * @param _rootChallenge Root challenge to add.
     */
    constructor(
        string memory _issuerCN,
        string memory _batchDesc,
        Challenge memory _rootChallenge
    ) {
        issueTime = block.timestamp;
        issuer = msg.sender;
        issuerCN = _issuerCN;
        batchDesc = _batchDesc;
        rootChallenge = _rootChallenge;
    }

    // Functions
    /**
     * @notice Revoke a credential by its hash.
     * @param _hash Unique hash identifying the credential.
     * @param _reason Reason for revocation.
     */
    function revoke(
        string calldata _hash,
        string calldata _reason
    ) external onlyIssuer isValid(_hash) {
        isRevoked[_hash] = Revoked({status: true, reason: _reason});
    }

    /**
     * @notice Returns the root challenge.
     * @return index Challenge index.
     * @return value Challenge value.
     * @return proofX X-coordinate of the proof point.
     * @return proofY Y-coordinate of the proof point.
     * @return commitX X-coordinate of the commitment point.
     * @return commitY Y-coordinate of the commitment point.
     */
    function getRootChallenge()
        external
        view
        returns (
            uint256 index,
            uint256 value,
            uint256 proofX,
            uint256 proofY,
            uint256 commitX,
            uint256 commitY
        )
    {
        return (
            rootChallenge.index,
            rootChallenge.value,
            rootChallenge.proof.X,
            rootChallenge.proof.Y,
            rootChallenge.commitment.X,
            rootChallenge.commitment.Y
        );
    }
}
