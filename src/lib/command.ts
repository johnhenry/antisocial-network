import { ProtoFile } from "@/types/types";
import parser from "yargs-parser";
import { MEME_PENDING } from "@/lib/database/create"; //TODO: let's move this out of there
export const command = async ({
  content = "",
  rendered = "",
  embedding,
  files = [],
}: {
  content?: string | typeof MEME_PENDING;
  rendered?: string;
  embedding?: number[];
  files?: ProtoFile[];
} = {}, {
  agent,
  file,
  response = false,
  target,
  streaming = false,
}: {
  agent?: string;
  file?: string;
  response?: boolean | string | number;
  target?: string;
  streaming?: boolean;
} = {}) => {
  const trimmed = content.slice(content.indexOf("/") + 1).trim();
  const parsed = parser(trimmed, {
    string: ["bar"],
  });
  console.log(parsed);
  throw new Error("Slash command not yet implemented");
};
export default command;
