import { Flex, Heading, HStack, Link } from "@chakra-ui/react";
import "@rainbow-me/rainbowkit/styles.css";
import { FaGithub, FaMailBulk } from "react-icons/fa";
import DarkModeSwitch from "./DarkModeSwitch.tsx";

const socialLinks = [
  {
    name: "GitHub",
    icon: <FaGithub />,
    link: "https://github.com/itzmealvin/BLOCKCHAIN_iuVecCert/",
  },
  { name: "Email", icon: <FaMailBulk />, link: "mailto: nqdieu@proton.me" },
];

const Footer = () => {
  return (
    <HStack p="10px" justifyContent="space-between">
      <HStack>
        <Heading as="h1" size="md">
          © 2024 IUVecCert. All rights reserved. Proudly made in 🇻🇳 by
          itzmealvin
        </Heading>
      </HStack>

      <HStack spacing={4}>
        {socialLinks.map(({ name, icon, link }) => (
          <Link
            key={name}
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            isExternal
            _hover={{ textDecoration: "none" }}
          >
            <Flex align="center" gap="10px">
              {icon}
              <Heading as="h3" size="sm">
                {name}
              </Heading>
            </Flex>
          </Link>
        ))}
        <DarkModeSwitch />
      </HStack>
    </HStack>
  );
};

export default Footer;
