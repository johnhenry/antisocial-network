import pdf from "pdf-parse-new";
import type { Parser } from "@/lib/parsers/types";
const parse: Parser = async (buffer: Buffer) => {
  const document = await pdf(buffer);
  const text = document.text.split("\n").join("");
  const metadata = { ...document, text: document.text } as { text?: string };
  delete metadata.text;
  return { metadata, text };
};
export default parse;
