import { Heading, HStack, Image, Link as ChakraLink } from "@chakra-ui/react";
import { Link as NavLink } from "react-router-dom";
import logo from "../../assets/favicon.png";
import ConnectWeb3Menu from "../Web3Auth/ConnectWeb3Menu";
import { tabs } from "../route";

const NavBar = () => {
  return (
    <HStack
      padding="10px"
      justifyContent="space-between"
      backgroundColor="blue.400"
      borderRadius={40}
    >
      <HStack>
        <Image src={logo} boxSize="50px" marginRight={2} />
        <Heading as="h1" size="lg">
          IU VerCert
        </Heading>
      </HStack>
      <HStack spacing={4}>
        {tabs.map((tab) => (
          <ChakraLink as={NavLink} key={tab.name} to={tab.path}>
            {tab.name}
          </ChakraLink>
        ))}
        <ConnectWeb3Menu />
      </HStack>
    </HStack>
  );
};

export default NavBar;
