import React from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import CopyIcon from "./icons/copy";
import CheckmarkIcon from "./icons/checkmark";
import { cn } from "../utils/";

interface MarkdownRendererProps {
  markdown: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ markdown }) => {
  const [copySuccess, setCopySuccess] = React.useState(null);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code).then(
      () => {
        setCopySuccess("Copied!");
        setTimeout(() => setCopySuccess(null), 2000);
      },
      () => {
        setCopySuccess("Failed to copy");
      }
    );
  };
  return (
    <ReactMarkdown
      children={markdown}
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          const codeString = String(children).replace(/\n$/, "");
          return !inline && match ? (
            <div className="relative">
              <SyntaxHighlighter
                className="rounded-md"
                children={codeString}
                style={vscDarkPlus}
                language={match[1]}
                PreTag="div"
                {...props}
              />
              <button
                onClick={() => handleCopy(codeString)}
                className="absolute top-2 right-2 bg-gray-400 bg-opacity-20 py-1 px-2 rounded-md border-none cursor-pointer text-gray-400 text-xs "
              >
                {copySuccess
                  ? <div className="flex place-items-center"><CheckmarkIcon />&nbsp;{copySuccess}</div>
                  : <div className="flex place-items-center"><CopyIcon />&nbsp;Copy code</div>}
              </button>
            </div>
          ) : (
            <code className={cn("bg-gray-400 bg-opacity-20 py-1 px-2 rounded-md border-none cursor-pointer text-gray-900 text-xs", className)} {...props}>
              {children}
            </code>
          );
        },
      }}
    />
  );
};

export default MarkdownRenderer;
