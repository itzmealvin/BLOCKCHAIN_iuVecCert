import { Heading, VStack } from "@chakra-ui/react";
import FlipClockCountdown from "@leenguyen/react-flip-clock-countdown";
import "@leenguyen/react-flip-clock-countdown/dist/index.css";

const Maintenance = () => {
  return (
    <VStack
      align="center"
      justify="center"
      h="100vh"
      textAlign="center"
      p="20px"
    >
      <Heading
        size="3xl"
        textAlign="center"
        mb={10}
        p={5}
        bgGradient="linear(to-r, red, orange, yellow.400)"
        bgClip="text"
      >
        IU-VecCert+ Maintenance Mode! <br />
        This website is currently down for maintenance purposes <br />
        Please comeback in
      </Heading>
      <FlipClockCountdown to={new Date().getTime() + 60 * 24 * 3600 * 1000} />
    </VStack>
  );
};

export default Maintenance;
