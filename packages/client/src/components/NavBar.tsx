import { Flex, Heading, HStack, Image, Link } from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { NavLink } from "react-router-dom";
import logo from "../assets/iu.png";
import { tabs } from "../route.tsx";

const NavBar = () => {
  return (
    <HStack p="10px" justifyContent="space-between" borderRadius={30}>
      <Link as={NavLink} to="/" _hover={{ textDecoration: "none" }}>
        <Flex align="center" gap="10px">
          <Image src={logo} boxSize="50px" mr={2} />
          <Heading as="h1" size="lg">
            IU-VecCert+
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
  );
};

export default NavBar;
