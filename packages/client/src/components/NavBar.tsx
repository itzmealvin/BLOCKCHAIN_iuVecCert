import {
  Box,
  Flex,
  Heading,
  HStack,
  Image,
  Link,
  Text,
} from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { NavLink } from "react-router-dom";
import logo from "../assets/iu.png";
import { tabs } from "../route.tsx";

const NavBar = () => {
  return (
    <>
      <Box
        pos="sticky"
        top="0"
        bg="blue.400"
        color="white"
        p={2}
        zIndex="banner"
      >
        <Text whiteSpace="normal" fontSize="sm" textAlign="center">
          <strong>PHISHING WARNING:</strong> please make sure you're visiting{" "}
          <Link
            as={NavLink}
            to="https://iuveccert.vercel.app"
            fontWeight="bold"
            textDecoration="underline"
          >
            iuveccert.vercel.app
          </Link>{" "}
          - check the URL carefully. If you want to visit IU-VecCert+, please go
          to{" "}
          <Link
            as={NavLink}
            to="https://iuveccertplus.vercel.app"
            fontWeight="bold"
            textDecoration="underline"
          >
            iuveccertplus.vercel.app
          </Link>
        </Text>
      </Box>
      <HStack p="10px" justifyContent="space-between" borderRadius={30}>
        <Link as={NavLink} to="/" _hover={{ textDecoration: "none" }}>
          <Flex align="center" gap="10px">
            <Image src={logo} boxSize="50px" mr={2} />
            <Heading as="h1" size="lg">
              IUVecCert
            </Heading>
          </Flex>
        </Link>
        <HStack spacing={50}>
          {tabs.map(({ name, path }) => (
            <Link
              as={NavLink}
              key={path}
              to={path}
              _hover={{ textDecoration: "none" }}
              _activeLink={{ color: "blue.400" }}
            >
              <Heading as="h1" size="md">
                {name}
              </Heading>
            </Link>
          ))}
        </HStack>
        <ConnectButton
          accountStatus="address"
          chainStatus="none"
          showBalance={false}
        />
      </HStack>
    </>
  );
};

export default NavBar;
