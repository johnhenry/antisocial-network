import type { Chunker } from "@/lib/chunkers/types";
import { embed as defaultEmbed } from "@/lib/ai";
import cosineSimilarity from "@/lib/util/cosine-similarity";
// import compromise from "compromise";

import sentenceChunker from "@/lib/chunkers/sentence";

// TODO: Create semantic chunker
export const createSemanticChunker = ({
  embed = defaultEmbed,
}: {
  embed?: typeof defaultEmbed;
} = {}): Chunker<[string, number[]][]> => {
  return async function* (text: string) {
    for await (const chunk of sentence(text)) {
      yield [chunk, await embed(chunk)];
    }
  };
};
export default await createSemanticChunker();
