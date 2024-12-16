import { Box, chakra, Code } from "@chakra-ui/react";
import Markdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

interface Props {
  content: string;
}

const ChakraMarkdown = chakra(Markdown, {
  baseStyle: {
    h1: { fontSize: "4xl", fontWeight: "bold", mt: 4, mb: 2 },
    h2: { fontSize: "2xl", fontWeight: "semibold", mt: 4, mb: 2 },
    h3: { fontSize: "xl", fontWeight: "medium", mt: 4, mb: 2 },
    p: { fontSize: "md", mt: 2, mb: 2 },
    ul: { pl: 4, mt: 2, mb: 2 },
    li: { fontSize: "md", mb: 1 },
    a: { color: "blue.500", textDecoration: "underline" },
  },
});

const MDRenderer = ({ content }: Props) => {
  return (
    <Box maxH="75vh" overflowY="auto" p={4}>
      <ChakraMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          code({ className, children }) {
            const match = /language-(\w+)/.exec(className || "");
            return match
              ? (
                <SyntaxHighlighter
                  PreTag="div"
                  language={match[1]}
                  style={dracula}
                  showLineNumbers
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              )
              : <Code>{children}</Code>;
          },
        }}
      >
        {content}
      </ChakraMarkdown>
    </Box>
  );
};

export default MDRenderer;
