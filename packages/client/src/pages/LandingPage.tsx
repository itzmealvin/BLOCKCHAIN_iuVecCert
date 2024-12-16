import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Link,
} from "@chakra-ui/react";
import { NavLink } from "react-router-dom";

const LandingPage = () => {
  const buttonContents = [
    {
      path: "docs",
      name: "View Documentation",
    },
    {
      path: "about",
      name: "About IUVecCert",
    },
  ];

  return (
    <Card align="center" my={20} p={8} shadow="xl" borderRadius="2xl">
      <CardHeader>
        <Heading
          size="4xl"
          textAlign="center"
          mb={10}
          p={5}
          bgGradient="linear(to-r, blue.300, green.600, yellow.500)"
          bgClip="text"
        >
          A Verkle Tree Certificate Issuance Protocol <br />
          Made easy with IUVecCert
        </Heading>
      </CardHeader>
      <CardBody>
        {buttonContents.map((buttonContent) => (
          <Button
            key={buttonContent.path}
            colorScheme="blue"
            variant="outline"
            size="lg"
            mx={2}
            p={10}
            borderRadius="3xl"
          >
            <Link
              as={NavLink}
              to={buttonContent.path}
              _hover={{ textDecoration: "none" }}
              fontSize="4xl"
            >
              {buttonContent.name}
            </Link>
          </Button>
        ))}
      </CardBody>
    </Card>
  );
};

export default LandingPage;
