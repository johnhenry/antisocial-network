import type { Chunker } from "@/lib/chunkers/types";
import compromise from "compromise";

export const create = ({}: {} = {}): Chunker => {
  return async function* (text: string) {
    const doc = compromise(text);
    const sentences = doc.sentences().out("array");
    for (const sentence of sentences) {
      yield sentence;
    }
  };
};
export default await create();
