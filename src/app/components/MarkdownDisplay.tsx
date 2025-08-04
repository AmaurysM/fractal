import { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import { marked } from "marked";

export function MarkdownDisplay({ markdown }: { markdown: string }) {
  const [html, setHtml] = useState("");

  useEffect(() => {
    const convert = async () => {
      const rawHtml = await marked.parse(markdown);
      setHtml(DOMPurify.sanitize(rawHtml));
    };
    convert();
  }, [markdown]);

  return (
    <div
      className="prose prose-invert max-w-none text-sm leading-relaxed"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
