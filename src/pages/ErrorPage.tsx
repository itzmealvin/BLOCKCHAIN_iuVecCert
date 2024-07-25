import { Box, Heading, Link as ChakraLink, Text } from "@chakra-ui/react";
import { Link as NavLink, useRouteError } from "react-router-dom";

const ErrorPage = () => {
  const error = useRouteError();

  return (
    <Box
      p={8}
      minH="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Heading as="h1" size="4xl" mb={4} fontWeight="bold" color="red.500">
        {error ? "URL not found!" : "Critical error ocurred!"}
      </Heading>
      <Text as="h2" fontSize="2xl" mb={6}>
        We apologize for the inconvenience. Please try again later.
      </Text>
      <ChakraLink as={NavLink} to="/">
        Return to Homepage!
      </ChakraLink>
    </Box>
  );
};

export default ErrorPage;
