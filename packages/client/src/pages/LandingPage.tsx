import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Link,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

const words = [
  "easy-to-implement",
  "constant-size-proof",
  "non-interactive-verification",
];

const LandingPage = () => {
  const [currentWord, setCurrentWord] = useState(words[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prevWord) => {
        const currentIndex = words.indexOf(prevWord);
        return words[(currentIndex + 1) % words.length];
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

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
          A Scalable Credential Issuance Protocol <br />
          Made {currentWord} with IUVecCert
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
