import { Box, Button, Heading, Link, Text } from "@chakra-ui/react";
import { isRouteErrorResponse, NavLink, useRouteError } from "react-router-dom";

const ErrorPage = () => {
  const error = useRouteError();
  const errorMessage = isRouteErrorResponse(error)
    ? (
      <>
        IUVecCert ERROR:
        <br />
        URL not found!
      </>
    )
    : (
      <>
        IUVecCert ERROR:
        <br />
        An unexpected error occurred!
      </>
    );

  return (
    <Box
      p={8}
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Heading as="h1" size="4xl" mb={4} fontWeight="bold" color="red.500">
        {errorMessage}
      </Heading>
      <Text fontSize="xl" mb={6}>
        We apologize for the inconvenience. Please try again later
      </Text>
      <Button colorScheme="blue" variant="ghost">
        <Link
          as={NavLink}
          to="/"
          fontSize="lg"
          color="teal.500"
          _hover={{ textDecoration: "none" }}
        >
          Return to Homepage
        </Link>
      </Button>
    </Box>
  );
};

export default ErrorPage;
