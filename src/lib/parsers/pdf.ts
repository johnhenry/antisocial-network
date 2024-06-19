import pdf from "pdf-parse-new";
import type { Parser } from "@/lib/parsers/types";
import type { Chunker } from "@/lib/chunkers/types";
import defaultChunker from "@/lib/chunkers/default";
const parse: Parser = async (
  buffer: Buffer,
  chunker: Chunker = defaultChunker
) => {
  const document = await pdf(buffer);
  // const { text } = document;
  const text = document.text.split("\n").join("");
  const metadata = { ...document, text: document.text } as { text?: string };
  delete metadata.text;
  const content = chunker(text);
  return { metadata, content };
};
export default parse;
