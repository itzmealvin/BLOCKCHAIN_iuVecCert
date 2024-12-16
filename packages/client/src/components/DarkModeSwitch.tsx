import { HStack, Switch, Text, useColorMode } from "@chakra-ui/react";

const DarkModeSwitch = () => {
  const { toggleColorMode, colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  return (
    <HStack>
      <Text whiteSpace="nowrap">Dark Mode</Text>
      <Switch
        colorScheme="green"
        isChecked={isDark}
        onChange={toggleColorMode}
      />
    </HStack>
  );
};

export default DarkModeSwitch;
