import { Grid, GridItem } from "@chakra-ui/react";
import InfoTile from "../components/InfoTile.tsx";

const tiles = [
  {
    title: "All-in-one tooling for credentials issuance",
    description:
      "Provides a unified platform for issuing, and verifying credentials. This tool streamlines the whole process, reducing manual effort and ensuring consistency. Users benefit from reduced administrative overhead and optimized workflows",
    colSpan: 5,
    rowSpan: 1,
  },
  {
    title: "Constant size proof",
    description:
      "IUVecCert delivers constant-size proofs regardless of the number of credentials issued, ensuring minimal overhead for issuers and seamless verification for users. This approach enhances scalability and performance",
    colSpan: 3,
    rowSpan: 1,
  },
  {
    title: "Revocation",
    description:
      "Provides a mechanism for revoking credentials when necessary, ensuring that invalid credentials can no longer be used. Issuers benefit from enhanced control and reliability of the certification process",
    colSpan: 1,
    rowSpan: 1,
  },
  {
    title: "Vector Commitment",
    description:
      "IUVecCert leverages vector commitments to keep the proof storage constant, while dealing with reasonable computational efficiency. This ensures secure, fast, and scalable issuance and verification of credentials",
    colSpan: 3,
    rowSpan: 1,
  },
  {
    title: "IUVecCert",
    colSpan: 4,
    rowSpan: 1,
  },
  {
    title: "Embedded receipt",
    description:
      "Facilitates the direct integration of the proof credentials into one easy PDF file. Learners can embed credentials into platforms without having to hold separate digital files",
    colSpan: 2,
    rowSpan: 1,
  },

  {
    title: "Security from blockchain",
    description:
      "Leverages blockchain technology to secure credentials with tamper-proof mechanisms. Users gain confidence in the immutability and transparency of their credentials",
    colSpan: 3,
    rowSpan: 1,
  },
  {
    title: "Scientifically proven",
    description: (
      <>
        The technology behind IUVecCert has been scientifically proven by
        prestigious conference(s){" "}
        <a
          href="https://doi.org/10.1007/978-981-96-0434-0_8"
          target="_blank"
          rel="noopener noreferrer"
        >
          [1]
        </a>
      </>
    ),
    colSpan: 3,
    rowSpan: 1,
  },
  {
    title: "Non-interactive verification",
    description:
      "Supports verification without requiring direct interaction with the issuer. This simplifies the process for verifiers and provides convenience to them by reducing dependency on third-party responses",
    colSpan: 3,
    rowSpan: 1,
  },
  {
    title: "Zero-cost verification",
    description:
      "Enables verification of credentials without incurring additional costs, utilizing efficient cryptographic techniques. This feature benefits issuers and verifiers by minimizing operational expenses",
    colSpan: 4,
    rowSpan: 1,
  },
  {
    title: "Scalable design",
    description:
      "Ensures that the system can handle a growing number of users and credentials without performance degradation. This scalability guarantees a smooth user experience even as demand increases",
    colSpan: 3,
    rowSpan: 1,
  },
  {
    title: "Easy to use",
    description:
      "IUVecCert simplifies the credentials issuance process, ensuring that issuers and users can interact seamlessly without requiring extensive technical knowledge. The intuitive design guarantees ease of use for all end users",
    colSpan: 2,
    rowSpan: 1,
  },
];

const AboutPage = () => {
  return (
    <Grid templateColumns="repeat(9, 1fr)">
      {tiles.map((tile, index) => (
        <GridItem
          key={index}
          colSpan={tile.colSpan}
          rowSpan={tile.rowSpan}
          p={3}
          transition="transform 0.2s"
          _hover={{
            transform: "scale(1.02)",
          }}
        >
          <InfoTile title={tile.title} description={tile.description} />
        </GridItem>
      ))}
    </Grid>
  );
};

export default AboutPage;
