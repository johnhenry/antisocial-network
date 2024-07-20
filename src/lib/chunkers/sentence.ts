import type { Chunker } from "@/lib/chunkers/types";
import compromise from "compromise";

// Iterator that chunks senteneces into a stream of strings with maximum length
const splitter = function* (text: string, maxLength: number = 2 ** 8) {
  let start = 0;
  let end = maxLength;
  while (start < text.length) {
    yield text.slice(start, end);
    start = end;
    end = Math.min(end + maxLength, text.length);
  }
};

export const create = ({}: {} = {}, split = false): Chunker => {
  return async function* (text: string) {
    const doc = compromise(text);
    const sentences = doc.sentences().out("array");

    if (split) {
      for (const sentence of sentences) {
        yield* splitter(sentence);
      }
    } else {
      for (const sentence of sentences) {
        yield sentence;
      }
    }
  };
};
export default await create();
