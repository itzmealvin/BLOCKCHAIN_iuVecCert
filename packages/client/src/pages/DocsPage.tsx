import { Box, Heading, VStack } from "@chakra-ui/react";
import { useState } from "react";
import { toast } from "react-toastify";
import MDRenderer from "../components/MDRenderer.tsx";

interface Heading {
  title: string;
  file: string;
}

interface HeadingCollection extends Heading {
  subheadings: Heading[];
  lastUpdate: string;
}

const DocsPage = () => {
  const headings: HeadingCollection[] = [
    {
      title: "Getting Started",
      file: "getting-started.md",
      subheadings: [],
      lastUpdate: "December 17th, 2024",
    },
    {
      title: "Using @iuveccert/issuer",
      file: "using-issuer.md",
      subheadings: [],
      lastUpdate: "December 17th, 2024",
    },
    {
      title: "Using @iuveccert/client",
      file: "using-client.md",
      subheadings: [],
      lastUpdate: "December 17th, 2024",
    },
    {
      title: "Troubleshooting",
      file: "troubleshooting.md",
      subheadings: [],
      lastUpdate: "None",
    },
    {
      title: "License",
      file: "license.md",
      subheadings: [],
      lastUpdate: "December 17th, 2024",
    },
  ];

  const [currentContent, setCurrentContent] = useState<string>("");

  const handleItemClick = async (file: string) => {
    try {
      const response = await fetch(`/markdown/${file}`);

      if (!response.ok) {
        throw new Error(`File not found: ${file}`);
      }

      const contentType = response.headers.get("Content-Type");
      if (!contentType || !contentType.includes("text/markdown")) {
        throw new Error("Unexpected response type. Markdown file expected.");
      }

      const content = await response.text();
      setCurrentContent(content);
    } catch (error) {
      console.error(error);
      toast.error("IUVecCert Error: Can't retrieve the documentation file");
    }
  };

  return (
    <Box display="flex">
      <VStack
        align="start"
        p={5}
        w="30vh"
        spacing={10}
        borderRight="2px solid #ccc"
      >
        {headings.map((heading, index) => (
          <Box key={heading.title} w="100%">
            <Heading
              as="h2"
              size="md"
              cursor="pointer"
              onClick={() => handleItemClick(heading.file)}
            >
              {heading.title}
            </Heading>
            Last updated: {headings[index].lastUpdate}
            {heading.subheadings.length > 0 && (
              <VStack align="start" pl={5} spacing={5}>
                {heading.subheadings.map((subheading) => (
                  <Heading
                    as="h3"
                    size="sm"
                    cursor="pointer"
                    onClick={() => handleItemClick(heading.file)}
                  >
                    {subheading.title}
                  </Heading>
                ))}
              </VStack>
            )}
          </Box>
        ))}
      </VStack>
      <Box flex={1} p={4}>
        <MDRenderer content={currentContent} />
      </Box>
    </Box>
  );
};

export default DocsPage;
