import type { Chunker, Embedding } from "@/lib/chunkers/types";
import compromise from "compromise";
import { embed as defaultEmbed } from "@/lib/ai";
// Iterator that chunks senteneces into a stream of strings with maximum length
const splitter = function* (text: string, split: number = 2 ** 8) {
  let start = 0;
  let end = split;
  while (start < text.length) {
    yield text.slice(start, end);
    start = end;
    end = Math.min(end + split, text.length);
  }
};

export const createUnembededSentenceChunker = (
  { split = 0 }: { split?: number } = {},
): Chunker<string, string> => {
  // TODO: this can probably be synchronous, but I need ot update some types
  return async function* (text: string) {
    const doc = compromise(text);
    const sentences = doc.sentences().out("array");

    if (split) {
      for (const sentence of sentences) {
        yield* splitter(sentence, split);
      }
    } else {
      for (const sentence of sentences) {
        yield sentence;
      }
    }
  };
};

export const createSentenceChunker = ({
  embed = defaultEmbed,
  split = 0,
}: {
  embed?: typeof defaultEmbed;
  split?: number;
} = {}): Chunker => {
  const sentence = createUnembededSentenceChunker({ split });
  //@ts-ignore
  return async function* (text: string) {
    for await (const chunk of sentence(text)) {
      yield [chunk, await embed(chunk)];
    }
  };
};

export default createSentenceChunker;
