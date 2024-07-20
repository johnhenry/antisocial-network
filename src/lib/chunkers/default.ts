import type { Chunker } from "@/lib/chunkers/types";
const chunkerDefault: Chunker = async function* (text: string) {
  yield text;
};
export default chunkerDefault;
