// SPDX-License-Identifier: GPL-3.0-or-later
// Optimized from https://github.com/appliedzkp/semaphore/blob/master/contracts/sol/verifier.sol
pragma solidity ^0.8.0;

import {Constants} from "./Constants.sol";
import {Pairing} from "./Pairing.sol";

/**
 * @title Verifier
 * @author Quang-Dieu Nguyen
 * @notice Contract to verify KZG Commitment on-chain
 */
contract Verifier {
    using Pairing for *;

    Constants public constantsContract;
    Pairing.G1Point public SRS_G1_0;
    Pairing.G2Point g2Generator;
    Pairing.G2Point SRS_G2_1;

    // Constructor
    /**
     * @notice Initializes the contract with issuer information and pre-allocates challenge slots.
     * @param _constantsContract Deployed constant contract address
     */
    constructor(address _constantsContract) {
        constantsContract = Constants(_constantsContract);

        // Initialize G1 generator and G2 points
        SRS_G1_0 = Pairing.G1Point({
            X: constantsContract.SRS_G1_X(0),
            Y: constantsContract.SRS_G1_Y(0)
        });

        g2Generator = Pairing.G2Point({
            X: [
        constantsContract.SRS_G2_X_0(0),
        constantsContract.SRS_G2_X_1(0)
        ],
            Y: [
        constantsContract.SRS_G2_Y_0(0),
        constantsContract.SRS_G2_Y_1(0)
        ]
        });

        SRS_G2_1 = Pairing.G2Point({
            X: [
        constantsContract.SRS_G2_X_0(1),
        constantsContract.SRS_G2_X_1(1)
        ],
            Y: [
        constantsContract.SRS_G2_Y_0(1),
        constantsContract.SRS_G2_Y_1(1)
        ]
        });
    }

    /**
     * @notice Verifies a single-point evaluation of a polynomial using the KZG commitment scheme.
     * @param _commitment The KZG polynomial commitment.
     * @param _proof The proof of the polynomial evaluation.
     * @param _index The x-value at which to evaluate the polynomial.
     * @param _value The result of the polynomial evaluation.
     * @return `true` if the proof is valid, `false` otherwise.
     */
    function verify(
        Pairing.G1Point memory _commitment,
        Pairing.G1Point memory _proof,
        uint256 _index,
        uint256 _value
    ) public view returns (bool) {
        uint256 BABYJUB_P = constantsContract.BABYJUB_P();

        // Check input ranges
        require(
            _commitment.X < BABYJUB_P && _commitment.Y < BABYJUB_P,
            "Verifier: Commitment out of range"
        );
        require(
            _proof.X < BABYJUB_P && _proof.Y < BABYJUB_P,
            "Verifier: Proof out of range"
        );
        require(_index < BABYJUB_P, "Verifier: Index out of range");
        require(_value < BABYJUB_P, "Verifier: Value out of range");

        // Compute commitment - aCommitment (optimized to avoid recalculating G1 point for SRS_G1_0 * value multiple times)
        Pairing.G1Point memory commitmentMinusA = Pairing.plus(
            _commitment,
            Pairing.negate(Pairing.mulScalar(SRS_G1_0, _value))
        );

        // Negate the proof
        Pairing.G1Point memory negProof = Pairing.negate(_proof);

        // Compute index * proof
        Pairing.G1Point memory indexMulProof = Pairing.mulScalar(
            _proof,
            _index
        );

        // Pairing check: e((index * proof) + (commitment - aCommitment), G2.g) == e(-proof, SRS_G2_1)
        return
            Pairing.pairing(
            Pairing.plus(indexMulProof, commitmentMinusA),
            g2Generator,
            negProof,
            SRS_G2_1
        );
    }

    /**
     * @notice Generates a KZG commitment to a polynomial.
     * @param coefficients The coefficients of the polynomial.
     * @return The KZG commitment.
     */
    function commit(
        uint256[] memory coefficients
    ) internal view returns (Pairing.G1Point memory) {
        Pairing.G1Point memory result = Pairing.G1Point(0, 0);
        uint256 length = coefficients.length;

        // Loop over coefficients and compute G1 commitment
        for (uint256 i = 0; i < length; ++i) {
            result = Pairing.plus(
                result,
                Pairing.mulScalar(
                    Pairing.G1Point(
                        constantsContract.SRS_G1_X(i),
                        constantsContract.SRS_G1_Y(i)
                    ),
                    coefficients[i]
                )
            );
        }

        return result;
    }

    /**
     * @notice Evaluates a polynomial at a given point.
     * @param _coefficients The coefficients of the polynomial.
     * @param _index The x-value to evaluate the polynomial at.
     * @return The evaluation result.
     */
    function evalPolyAt(
        uint256[] memory _coefficients,
        uint256 _index
    ) internal view returns (uint256) {
        uint256 result = 0;
        uint256 powerOfX = 1;
        uint256 m = constantsContract.BABYJUB_P();

        for (uint256 i = 0; i < _coefficients.length; ++i) {
            uint256 coeff = _coefficients[i];
            assembly {
                result := addmod(result, mulmod(powerOfX, coeff, m), m)
                powerOfX := mulmod(powerOfX, _index, m)
            }
        }

        return result;
    }

    /**
     * @notice Verifies multi-point evaluations of a polynomial using the KZG commitment scheme.
     * @param _commitment The KZG commitment.
     * @param _proof The proof of the polynomial evaluation.
     * @param _indices The x-values of the evaluations.
     * @param _values The evaluated y-values of the polynomial.
     * @param _iCoeffs The coefficients of the polynomial interpolating the x-values and y-values.
     * @param _zCoeffs The coefficients of the polynomial intersecting y=0 for each x-value.
     * @return `true` if the proof is valid, `false` otherwise.
     */
    function verifyMulti(
        Pairing.G1Point memory _commitment,
        Pairing.G2Point memory _proof,
        uint256[] memory _indices,
        uint256[] memory _values,
        uint256[] memory _iCoeffs,
        uint256[] memory _zCoeffs
    ) public view returns (bool) {
        uint256 BABYJUB_P = constantsContract.BABYJUB_P();

        // Range checks for inputs
        require(
            _commitment.X < BABYJUB_P && _commitment.Y < BABYJUB_P,
            "Verifier: Commitment out of range"
        );
        require(
            _proof.X[0] < BABYJUB_P &&
            _proof.X[1] < BABYJUB_P &&
            _proof.Y[0] < BABYJUB_P &&
            _proof.Y[1] < BABYJUB_P,
            "Verifier: Proof out of range"
        );

        for (uint256 i = 0; i < _iCoeffs.length; ++i) {
            require(_iCoeffs[i] < BABYJUB_P, "Verifier: iCoeffs out of range");
        }

        for (uint256 i = 0; i < _zCoeffs.length; ++i) {
            require(_zCoeffs[i] < BABYJUB_P, "Verifier: zCoeffs out of range");
        }

        // Validate indices and values, ensuring zEval and iEval are correct
        for (uint256 i = 0; i < _indices.length; ++i) {
            require(_indices[i] < BABYJUB_P, "Verifier: Index out of range");
            require(_values[i] < BABYJUB_P, "Verifier: Value out of range");
            require(
                evalPolyAt(_zCoeffs, _indices[i]) == 0,
                "Verifier: Invalid zCoeffs"
            );
            require(
                evalPolyAt(_iCoeffs, _indices[i]) == _values[i],
                "Verifier: Invalid iCoeffs"
            );
        }

        // Generate commitments to i and z polynomials
        Pairing.G1Point memory zCommit = commit(_zCoeffs);
        Pairing.G1Point memory iCommit = commit(_iCoeffs);

        // Compute commitment - iCommit
        Pairing.G1Point memory commitmentMinusICommit = Pairing.plus(
            _commitment,
            Pairing.negate(iCommit)
        );

        // Perform the pairing check
        return
            Pairing.pairing(
            Pairing.negate(zCommit),
            _proof,
            commitmentMinusICommit,
            g2Generator
        );
    }
}
