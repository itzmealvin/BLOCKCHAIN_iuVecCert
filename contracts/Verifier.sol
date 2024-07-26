// SPDX-License-Identifier: MIT
// Modified from https://github.com/appliedzkp/semaphore/blob/master/contracts/sol/verifier.sol
pragma experimental ABIEncoderV2;
pragma solidity ^0.8.0;

import "./Pairing.sol";
import "./Constants.sol";

contract Verifier {
    using Pairing for *;

    Constants public constantsContract;
    Pairing.G1Point SRS_G1_0;
    Pairing.G2Point g2Generator;
    Pairing.G2Point SRS_G2_1;

    constructor(address _constantsContract) {
        constantsContract = Constants(_constantsContract);

        // The G1 generator
        SRS_G1_0 = Pairing.G1Point({
            X: constantsContract.SRS_G1_X(0),
            Y: constantsContract.SRS_G1_Y(0)
        });

        // The G2 generator
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

    /*
     * Verifies a single-point evaluation of a polynominal using the KZG
     * commitment scheme.
     *    - p(X) is a polynominal
     *    - _value = p(_index)
     *    - commitment = commit(p)
     *    - proof = genProof(p, _index, _value)
     * Returns true if and only if the following holds, and returns false
     * otherwise:
     *     e(commitment - commit([_value]), G2.g) == e(proof, commit([0, 1]) - zCommit)
     * @param _commitment The KZG polynominal commitment.
     * @param _proof The proof.
     * @param _index The x-value at which to evaluate the polynominal.
     * @param _value The result of the polynominal evaluation.
     */
    function verify(
        Pairing.G1Point memory _commitment,
        Pairing.G1Point memory _proof,
        uint256 _index,
        uint256 _value
    ) public view returns (bool) {
        // Make sure each parameter is less than the prime q
        require(
            _commitment.X < constantsContract.BABYJUB_P(),
            "Verifier.verifyKZG: _commitment.X is out of range"
        );
        require(
            _commitment.Y < constantsContract.BABYJUB_P(),
            "Verifier.verifyKZG: _commitment.Y is out of range"
        );
        require(
            _proof.X < constantsContract.BABYJUB_P(),
            "Verifier.verifyKZG: _proof.X is out of range"
        );
        require(
            _proof.Y < constantsContract.BABYJUB_P(),
            "Verifier.verifyKZG: _proof.Y is out of range"
        );
        require(
            _index < constantsContract.BABYJUB_P(),
            "Verifier.verifyKZG: _index is out of range"
        );
        require(
            _value < constantsContract.BABYJUB_P(),
            "Verifier.verifyKZG: _value is out of range"
        );

        // Check that
        //     e(commitment - aCommit, G2.g) == e(proof, xCommit - zCommit)
        //     e(commitment - aCommit, G2.g) / e(proof, xCommit - zCommit) == 1
        //     e(commitment - aCommit, G2.g) * e(proof, xCommit - zCommit) ^ -1 == 1
        //     e(commitment - aCommit, G2.g) * e(-proof, xCommit - zCommit) == 1
        // where:
        //     aCommit = commit([_value]) = SRS_G1_0 * _value
        //     xCommit = commit([0, 1]) = SRS_G2_1
        //     zCommit = commit([_index]) = SRS_G2_1 * _index

        // To avoid having to perform an expensive operation in G2 to compute
        // xCommit - zCommit, we instead check the equivalent equation:
        //     e(commitment - aCommit, G2.g) * e(-proof, xCommit) * e(-proof, -zCommit) == 1
        //     e(commitment - aCommit, G2.g) * e(-proof, xCommit) * e(proof, zCommit) == 1
        //     e(commitment - aCommit, G2.g) * e(-proof, xCommit) * e(index * proof, G2.g) == 1
        //     e((index * proof) + (commitment - aCommit), G2.g) * e(-proof, xCommit) == 1

        // Compute commitment - aCommitment
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

        // Returns true if and only if
        // e((index * proof) + (commitment - aCommitment), G2.g) * e(-proof, xCommit) == 1
        return
            Pairing.pairing(
            Pairing.plus(indexMulProof, commitmentMinusA),
            g2Generator,
            negProof,
            SRS_G2_1
        );
    }

    /*
     * @return A KZG commitment to a polynominal
     * @param coefficients The coefficients of the polynomial to which to
     *                     commit.
     */
    function commit(
        uint256[] memory coefficients
    ) internal view returns (Pairing.G1Point memory) {
        Pairing.G1Point memory result = Pairing.G1Point(0, 0);

        for (uint256 i = 0; i < coefficients.length; i++) {
            result = Pairing.plus(
                result,
                Pairing.mulScalar(
                    Pairing.G1Point({
                        X: constantsContract.SRS_G1_X(i),
                        Y: constantsContract.SRS_G1_Y(i)
                    }),
                    coefficients[i]
                )
            );
        }
        return result;
    }

    /*
     * @return The polynominal evaluation of a polynominal with the specified
     *         coefficients at the given index.
     */
    function evalPolyAt(
        uint256[] memory _coefficients,
        uint256 _index
    ) internal view returns (uint256) {
        uint256 m = constantsContract.BABYJUB_P();
        uint256 result = 0;
        uint256 powerOfX = 1;

        for (uint256 i = 0; i < _coefficients.length; i++) {
            uint256 coeff = _coefficients[i];
            assembly {
                result := addmod(result, mulmod(powerOfX, coeff, m), m)
                powerOfX := mulmod(powerOfX, _index, m)
            }
        }
        return result;
    }

    /*
     * Verifies the evaluation of multiple points of a polynominal using the
     * KZG commitment scheme.
     *    - p(X) is a polynominal
     *    - commitment = commit(p)
     *    - For each y in _values and each x in _indices, y = p(x)
     *    - proof = genMultiProof(p, _indices)
     * Returns true if and only if the following holds, and returns false
     * otherwise:
     *     e(-commit(zPoly), proof) * e(commitment - commit(iPoly), g) == 1
     * @param _commitment The polynominal commitment.
     * @param _proof The proof.
     * @param _indices The x-values at which to evaluate the polynominal.
     * @param _values The evaluation of the polynominal at each index.
     * @param _iCoeffs The coefficients of a polynominal which interpolates
     *                 each index and corresponding y-value.
     * @param _zCoeffs The coefficients of a polynominal which intersects y=0
     *                 for each index.
     */
    function verifyMulti(
        Pairing.G1Point memory _commitment,
        Pairing.G2Point memory _proof,
        uint256[] memory _indices,
        uint256[] memory _values,
        uint256[] memory _iCoeffs,
        uint256[] memory _zCoeffs
    ) public view returns (bool) {
        // Perform range checks
        require(
            _commitment.X < constantsContract.BABYJUB_P(),
            "Verifier.verifyMultiKZG: _commitment.X is out of range"
        );
        require(
            _commitment.Y < constantsContract.BABYJUB_P(),
            "Verifier.verifyMultiKZG: _commitment.Y is out of range"
        );
        require(
            _proof.X[0] < constantsContract.BABYJUB_P(),
            "Verifier.verifyKZG: _proof.X[0] is out of range"
        );
        require(
            _proof.X[1] < constantsContract.BABYJUB_P(),
            "Verifier.verifyKZG: _proof.X[1] is out of range"
        );
        require(
            _proof.Y[0] < constantsContract.BABYJUB_P(),
            "Verifier.verifyKZG: _proof.Y[0] is out of range"
        );
        require(
            _proof.Y[1] < constantsContract.BABYJUB_P(),
            "Verifier.verifyKZG: _proof.Y[1] is out of range"
        );

        for (uint256 i = 0; i < _iCoeffs.length; i++) {
            require(
                _iCoeffs[i] < constantsContract.BABYJUB_P(),
                "Verifier.verifyKZG: an _iCoeffs value is out of range"
            );
        }

        for (uint256 i = 0; i < _zCoeffs.length; i++) {
            require(
                _zCoeffs[i] < constantsContract.BABYJUB_P(),
                "Verifier.verifyKZG: an _zCoeffs value is out of range"
            );
        }

        // Check whether _iCoeffs and _zCoeffs are valid
        for (uint256 i = 0; i < _indices.length; i++) {
            uint256 index = _indices[i];
            uint256 value = _values[i];
            require(
                index < constantsContract.BABYJUB_P(),
                "Verifier.verifyKZG: an index is out of range"
            );
            require(
                value < constantsContract.BABYJUB_P(),
                "Verifier.verifyKZG: a value is out of range"
            );

            uint256 zEval = evalPolyAt(_zCoeffs, _indices[i]);
            require(zEval == 0, "Verifier.verifyMulti: invalid _zCoeffs");

            uint256 iEval = evalPolyAt(_iCoeffs, _indices[i]);
            require(
                iEval == _values[i],
                "Verifier.verifyMulti: invalid _iCoeffs"
            );
        }

        // Generate the KZG commitments to the i and z polynominals
        Pairing.G1Point memory zCommit = commit(_zCoeffs);
        Pairing.G1Point memory iCommit = commit(_iCoeffs);

        // Compute commitment - commit(iPoly)
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

    /*
    // Uncomment to perform gas benchmarks
    function commitBenchmark(
        uint256[] memory _coefficients
    ) public {
        commit(_coefficients);
    }

    function verifyMultiBenchmark(
        Pairing.G1Point memory _commitment,
        Pairing.G2Point memory _proof,
        uint256[] memory _indices,
        uint256[] memory _values,
        uint256[] memory _iCoeffs,
        uint256[] memory _zCoeffs
    ) public {
        verifyMulti(_commitment, _proof, _indices, _values, _iCoeffs, _zCoeffs);
    }
    */
}
