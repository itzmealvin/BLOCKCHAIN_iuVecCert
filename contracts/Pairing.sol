// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library Pairing {
    uint256 public constant PRIME_Q =
    21888242871839275222246405745257275088696311157297823662689037894645226208583;

    struct G1Point {
        uint256 X;
        uint256 Y;
    }

    // Encoding of field elements is: X[0] * z + X[1]
    struct G2Point {
        uint256[2] X;
        uint256[2] Y;
    }

    /*
     * @return The negation of G1 point `p`, i.e., p.plus(p.negate()) should equal the identity (zero) point.
     */
    function negate(G1Point memory p) internal pure returns (G1Point memory) {
        if (p.X == 0 && p.Y == 0) {
            // If the point is the identity, its negation is also the identity.
            return G1Point(0, 0);
        }
        // Return the negated point
        return G1Point(p.X, PRIME_Q - (p.Y % PRIME_Q));
    }

    /*
     * @return The sum of two G1 points `p1` and `p2`.
     */
    function plus(
        G1Point memory p1,
        G1Point memory p2
    ) internal view returns (G1Point memory r) {
        uint256[4] memory input = [p1.X, p1.Y, p2.X, p2.Y];
        bool success;

        assembly {
            success := staticcall(
                gas(),
                6, // Precompiled contract address for elliptic curve addition
                input,
                0xc0, // 4 * 32 bytes = 128 bytes input (4 uint256 values)
                r,
                0x60 // 2 * 32 bytes = 64 bytes output (G1Point)
            )
        }

        require(success, "Pairing: G1 addition failed");
    }

    /*
     * @return The product of a G1 point `p` and a scalar `s`.
     */
    function mulScalar(
        G1Point memory p,
        uint256 s
    ) internal view returns (G1Point memory r) {
        uint256[3] memory input = [p.X, p.Y, s];
        bool success;

        assembly {
            success := staticcall(
                gas(),
                7, // Precompiled contract address for elliptic curve scalar multiplication
                input,
                0x80, // 3 * 32 bytes = 96 bytes input (2 uint256 for point, 1 uint256 for scalar)
                r,
                0x60 // 2 * 32 bytes = 64 bytes output (G1Point)
            )
        }

        require(success, "Pairing: Scalar multiplication failed");
    }

    /*
     * @return The result of the pairing check e(a1, a2) * e(b1, b2) == 1.
     * This function returns true if the pairing operation holds and false otherwise.
     */
    function pairing(
        G1Point memory a1,
        G2Point memory a2,
        G1Point memory b1,
        G2Point memory b2
    ) internal view returns (bool) {
        G1Point[2] memory p1 = [a1, b1];
        G2Point[2] memory p2 = [a2, b2];

        uint256 inputSize = 12;
        uint256[] memory input = new uint256[](inputSize);

        for (uint256 i = 0; i < 2; i++) {
            uint256 j = i * 6;
            input[j] = p1[i].X;
            input[j + 1] = p1[i].Y;
            input[j + 2] = p2[i].X[0];
            input[j + 3] = p2[i].X[1];
            input[j + 4] = p2[i].Y[0];
            input[j + 5] = p2[i].Y[1];
        }

        uint256[1] memory out;
        bool success;

        assembly {
            success := staticcall(
                gas(),
                8, // Precompiled contract address for pairing check
                add(input, 0x20),
                mul(inputSize, 0x20),
                out,
                0x20 // Output is a single boolean value (0 or 1)
            )
        }

        require(success, "Pairing: Pairing check failed");

        return out[0] != 0;
    }
}
