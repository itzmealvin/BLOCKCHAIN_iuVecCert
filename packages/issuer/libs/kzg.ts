import * as galois from "@guildofweavers/galois";
import type { ec } from "elliptic";
import * as ffjavascript from "ffjavascript";
import assert from "node:assert";
import srsg1DataRaw from "../taug1_65536.json" with { type: "json" };
import srsg2DataRaw from "../taug2_65536.json" with { type: "json" };

type G1Point = ec;
type G2Point = ec;
type Coefficient = bigint;
type Commitment = G1Point;
type Proof = G1Point;

const G1 = ffjavascript.bn128.G1;
const G2 = ffjavascript.bn128.G2;
const FIELD_SIZE = BigInt(
  "21888242871839275222246405745257275088548364400416034343698204186575808495617",
);

// Load SRS G1 points from the ceremony data
const srsG1 = (depth: number): G1Point[] => {
  assert(depth > 0 && depth <= 65536, "Depth must be between 1 and 65536.");

  return srsg1DataRaw
    .slice(0, depth)
    // @ts-ignore: Working library implementation
    .map(([x, y]: [string, string]) => [BigInt(x), BigInt(y), BigInt(1)]);
};

// Load SRS G2 points from the ceremony data
const srsG2 = (depth: number): G2Point[] => {
  assert(depth > 0);
  assert(depth <= 65536);

  const g2: G2Point[] = [];
  for (let i = 0; i < depth; i++) {
    g2.push([
      [srsg2DataRaw[i][0], srsg2DataRaw[i][1]].map(BigInt),
      [srsg2DataRaw[i][2], srsg2DataRaw[i][3]].map(BigInt),
      [BigInt(1), BigInt(0)],
    ]);
  }
  assert(g2[0][0][0] === G2.g[0][0]);
  assert(g2[0][0][1] === G2.g[0][1]);
  assert(g2[0][1][0] === G2.g[1][0]);
  assert(g2[0][1][1] === G2.g[1][1]);
  assert(g2[0][2][0] === G2.g[2][0]);
  assert(g2[0][2][1] === G2.g[2][1]);

  return g2;
};

// Commit to a polynomial using SRS and G1 points
const commit = (coefficients: bigint[]): Commitment => {
  const srs = srsG1(coefficients.length);
  return polyCommit(coefficients, G1, srs);
};

// Commit polynomial function (helper)
const polyCommit = (
  coefficients: bigint[],
  G: G1Point,
  srs: G1Point[],
): G1Point => {
  return coefficients.reduce((acc, coeff, i) => {
    assert(coeff >= BigInt(0), "Coefficient must be non-negative.");
    return G.affine(G.add(acc, G.mulScalar(srs[i], coeff)));
  }, G.zero);
};

// Generate quotient polynomial for proof
const genQuotientPolynomial = (
  coefficients: Coefficient[],
  xVal: bigint,
  p: bigint = FIELD_SIZE,
): Coefficient[] => {
  const field = galois.createPrimeField(p);
  const poly = field.newVectorFrom(coefficients);
  const yVal = field.evalPolyAt(poly, xVal);
  const z = field.newVectorFrom([xVal]);
  const x = field.newVectorFrom([BigInt(0), BigInt(1)]);

  return field
    .divPolys(
      field.subPolys(poly, field.newVectorFrom([yVal])),
      field.subPolys(x, z),
    )
    .toValues();
};

// Evaluate polynomial at a given X
const evaluateAt = (
  coefficients: Coefficient[],
  xVal: bigint,
  p: bigint = FIELD_SIZE,
): bigint => {
  const field = galois.createPrimeField(p);
  return field.evalPolyAt(field.newVectorFrom(coefficients), xVal);
};

// Generate proof for specific index X
const genProof = (
  coefficients: Coefficient[],
  index: number | bigint,
  p: bigint = FIELD_SIZE,
): Proof => {
  const quotient = genQuotientPolynomial(coefficients, BigInt(index), p);
  return commit(quotient);
};

// Generate contract parameters for verifier contract
const genVerifierContractParams = (
  commitment: Commitment,
  proof: Proof,
  index: number | bigint,
  value: bigint,
) => {
  return {
    commitment: commitment.map(
      (point: { toString: (arg0: number) => string }) =>
        "0x" + point.toString(16),
    ),
    proof: proof.map(
      (point: { toString: (arg0: number) => string }) =>
        "0x" + point.toString(16),
    ),
    index: "0x" + index.toString(16),
    value: "0x" + value.toString(16),
  };
};

// Generate coefficients for polynomial interpolation
const genCoefficients = (
  values: bigint[],
  p: bigint = FIELD_SIZE,
): Coefficient[] => {
  const field = galois.createPrimeField(p);
  const xVals = field.newVectorFrom(values.map((_, i) => BigInt(i)));
  const yVals = field.newVectorFrom(values);
  const coefficients = field.interpolate(xVals, yVals).toValues();

  coefficients.forEach((coefficient) =>
    assert(coefficient < FIELD_SIZE, "Coefficient exceeds field size.")
  );
  return coefficients;
};

const verify = (
  commitment: Commitment,
  proof: Proof,
  index: number | bigint,
  value: bigint,
): boolean => {
  index = BigInt(index);

  const srs = srsG2(2);

  const aCommit = commit([BigInt(value)]);

  const lhs = ffjavascript.bn128.pairing(
    G1.affine(
      G1.add(
        G1.mulScalar(proof, index),
        G1.sub(commitment, aCommit),
      ),
    ),
    G2.g,
  );

  const rhs = ffjavascript.bn128.pairing(
    G1.affine(proof),
    srs[1],
  );

  return ffjavascript.bn128.F12.eq(lhs, rhs);
};

export {
  commit,
  evaluateAt,
  FIELD_SIZE,
  genCoefficients,
  genProof,
  genQuotientPolynomial,
  genVerifierContractParams,
  verify,
};
export type { Coefficient, Commitment, Proof };
