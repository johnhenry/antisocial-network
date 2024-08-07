import type { Chunker } from "@/lib/chunkers/types";
import { embed } from "@/lib/ai";
//@ts-ignore
const chunkerDefault: Chunker = async function* (text: string) {
  yield [text, await embed(text)];
};
export default chunkerDefault;
