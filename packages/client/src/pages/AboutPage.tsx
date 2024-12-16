import { Grid, GridItem } from "@chakra-ui/react";
import InfoTile from "../components/InfoTile.tsx";

const tiles = [
  {
    title: "All-in-one tooling for certificate issuance",
    description:
      "Provides a unified platform for generating, issuing, and verifying certificates. This tool streamlines the whole process, reducing manual effort and ensuring consistency. Users benefit from reduced administrative overhead and optimized workflows",
    colSpan: 3,
    rowSpan: 1,
  },
  {
    title: "Certificate validator",
    description:
      "Enables validation of merged certificates, ensuring authenticity and integrity from a data file. Issuers can validate credentials instantly, improving trust and reducing the risk of fraud",
    colSpan: 2,
    rowSpan: 1,
  },
  {
    title: "Merge certificates in seconds",
    description:
      "Allows issuers to generate multiple certificates from a single template document seamlessly. This feature is especially helpful for issuers who need to present consolidated credentials, saving time and ensuring a professional appearance. (*) Test conducted on specialized hardware",
    colSpan: 4,
    rowSpan: 1,
  },
  {
    title: "Verkle Tree",
    description:
      "Implements Verkle Tree structures to optimize certificate proof storage and computational time. This ensures fast access and reduces storage overhead, benefiting users by enhancing scalability and performance",
    colSpan: 2,
    rowSpan: 1,
  },
  {
    title: "IUVecCert",
    colSpan: 5,
    rowSpan: 1,
  },
  {
    title: "Embedded receipt",
    description:
      "Facilitates the direct integration of the proof certificates into one easy PDF file. Learners can embed certificates into platforms without having to hold separate digital files",
    colSpan: 2,
    rowSpan: 1,
  },
  {
    title: "Revocation",
    description:
      "Provides a mechanism for revoking certificates when necessary, ensuring that invalid credentials can no longer be used. Issuers benefit from enhanced control and reliability of the certification process",
    colSpan: 1,
    rowSpan: 1,
  },
  {
    title: "Security from blockchain",
    description:
      "Leverages blockchain technology to secure certificates with tamper-proof mechanisms. Users gain confidence in the immutability and transparency of their credentials",
    colSpan: 2,
    rowSpan: 1,
  },

  {
    title: "Selective disclosure",
    description:
      "Allows learners to share specific parts of their certificates while keeping other details private. This feature ensures privacy and enhances their control over their data",
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
      "Enables verification of certificates without incurring additional costs, utilizing efficient cryptographic techniques. This feature benefits issuers and verifiers by minimizing operational expenses",
    colSpan: 4,
    rowSpan: 1,
  },
  {
    title: "Scalable design",
    description:
      "Ensures that the system can handle a growing number of users and certificates without performance degradation. This scalability guarantees a smooth user experience even as demand increases",
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
