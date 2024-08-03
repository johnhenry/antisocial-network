import type { Chunker, Corpus, EmbeddedChunk } from "@/lib/chunkers/types";
import { embed as defaultEmbed } from "@/lib/ai";
import createSentenceChunker from "@/lib/chunkers/sentence";
import cosineSimilarity from "@/lib/util/cosine-similarity";
import findSignificantDropoffs from "@/lib/util/find-significant-dropoffs";
// import compromise from "compromise";

const cteateChunker = async function* (
  corpus: Corpus,
  embed = defaultEmbed,
  zScoreThreshold = 2,
): AsyncGenerator<EmbeddedChunk> {
  // Step 1: Analyze the entire corpus to find dropoffs in similarity
  let similarityDropoffs = [];
  for (let i = 1; i < corpus.length; i++) {
    const similarity = cosineSimilarity(corpus[i - 1][1], corpus[i][1]);
    similarityDropoffs.push({ index: i, dropoff: 1 - similarity });
  }

  // Step 2: Determine chunk boundaries based on statistically significant dropoffs
  const chunkBoundaries = await findSignificantDropoffs(
    similarityDropoffs,
    zScoreThreshold,
  );

  // Step 3: Yield semantically similar chunks
  let startIndex = 0;
  for (const endIndex of [...chunkBoundaries, corpus.length]) {
    const chunk = corpus.slice(startIndex, endIndex);
    const chunkText = chunk.map((item) => item[0]).join(" ");
    const chunkEmbedding = await embed(chunkText);

    yield [chunkText, chunkEmbedding];

    startIndex = endIndex;
  }
};
export const createSemanticChunker = ({
  embed = defaultEmbed,
  split = 0,
  zScoreThreshold = 2,
}: {
  embed?: typeof defaultEmbed;
  split?: number;
  zScoreThreshold?: number;
} = {}): Chunker => {
  const sentenceChunker = createSentenceChunker({ embed, split });
  return async function* (text: string) {
    const newCorpus: Corpus = [];
    for await (const sentence of sentenceChunker(text)) {
      newCorpus.push(sentence);
    }
    const chunky = await cteateChunker(newCorpus, embed, zScoreThreshold);
    for await (const chunk of chunky) {
      yield chunk;
    }
  };
};
export default createSemanticChunker;
