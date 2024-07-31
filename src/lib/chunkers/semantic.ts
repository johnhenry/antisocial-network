import type { Chunker } from "@/lib/chunkers/types";
import { embed as defaultEmbed } from "@/lib/ai";
import cosineSimilarity from "@/lib/util/cosine-similarity";
// import compromise from "compromise";

import sentence from "@/lib/chunkers/sentence";

// TODO: Create semantic chunker
export const createSemanticChunker = ({
  embed = defaultEmbed,
  similarity = cosineSimilarity,
}: {
  embed?: typeof defaultEmbed;
  similarity?: typeof cosineSimilarity;
} = {}): Chunker<{ chunk: string; embedding: number[] }> => {
  return async function* (text: string) {
    for await (const chunk of sentence(text)) {
      yield { chunk: chunk, embedding: await embed(chunk) };
    }
  };
};
export default await createSemanticChunker();
