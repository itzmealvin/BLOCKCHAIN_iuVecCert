import { Flex, Heading, VStack } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "../components/Footer.tsx";
import NavBar from "../components/NavBar.tsx";

const Layout = () => {
  const isMobile = /iPhone|iPod|Android/i.test(navigator.userAgent);

  if (isMobile) {
    return (
      <VStack
        align="center"
        justify="center"
        h="100vh"
        textAlign="center"
        p="20px"
      >
        <Heading
          size="2xl"
          textAlign="center"
          mb={10}
          p={5}
          bgGradient="linear(to-r, red, purple, blue)"
          bgClip="text"
        >
          IUVecCert WARNING! <br />
          Please visit this site on desktop for the best experience
        </Heading>
      </VStack>
    );
  }

  return (
    <>
      <NavBar />
      <Flex as="main" direction="column" flex="1" minH="85vh">
        <Outlet />
      </Flex>
      <Footer />
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        closeOnClick
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover
        theme="colored"
      />
    </>
  );
};

export default Layout;
