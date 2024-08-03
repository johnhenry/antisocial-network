import type { Chunker, EmbeddedChunk } from "@/lib/chunkers/types";
import ollama from "ollama";
import { embed } from "@/lib/ai";
import { createUnembededSentenceChunker } from "@/lib/chunkers/sentence";
import { getSettingsObject } from "@/lib/database/settings";

const decideBoundary = async (
  currentChunk: string[],
  nextSentences: string[],
  parameters?: { model?: string },
): Promise<boolean> => {
  const settings = await getSettingsObject();

  const [repo, model] = (parameters?.model || settings.modeltools)!.split("::");

  const messages = [
    {
      role: "system",
      content:
        `You are an AI designed to make binary decisions about text chunking.
      Your task is to determine if a new chunk should start given the current chunk and the next sentences.
      Consider factors like semantic coherence, length, and completeness of thought.
      Provide your decision as a boolean along with a confidence score between 0 and 1.
      Use the provided function to structure your response.`,
    },
    {
      role: "user",
      content: `Current chunk:
"${currentChunk.join(" ")}"

Next sentences:
"${nextSentences.join("\n")}"

Should a new chunk start? Respond using the provided function.`,
    },
  ];

  const response = await ollama.chat({
    model,
    messages: messages,
    tools: [
      {
        type: "function",
        function: {
          name: "provide_binary_response",
          description:
            "Provide a binary (true/false) response to the given statement",
          parameters: {
            type: "object",
            properties: {
              isTrue: {
                type: "boolean",
                description: "True if the statement is true, false otherwise",
              },
              confidence: {
                type: "number",
                description: "Confidence score between 0 and 1",
              },
              explanation: {
                type: "string",
                description: "Brief explanation for the decision",
              },
            },
            required: ["isTrue", "confidence"],
          },
        },
      },
    ],
  });

  if (
    !response.message.tool_calls || response.message.tool_calls.length === 0
  ) {
    console.log("The model didn't use the function. Its response was:");
    console.log(response.message.content);
    return false;
  }

  const toolCall = response.message.tool_calls[0];
  if (toolCall.function.name === "decide_new_chunk") {
    const { isTrue, confidence, explanation } = toolCall.function.arguments;
    console.log({ isTrue, confidence, explanation });
    return isTrue;
  }

  return false;
};
const createAgenticChunker = ({
  lookAhead = -1,
}: { lookAhead?: number } = {}): Chunker => {
  return async function* (
    text: string,
  ): AsyncGenerator<EmbeddedChunk> {
    const sentenceChunker = createUnembededSentenceChunker();
    const sentences = [];
    for await (const sentence of sentenceChunker(text)) {
      sentences.push(sentence);
    }

    if (lookAhead === -1) {
      lookAhead = sentences.length;
    }

    let currentChunk: string[] = [];

    for (let i = 0; i < sentences.length; i++) {
      const currentSentence = sentences[i];
      currentChunk.push(currentSentence);

      if (i === sentences.length - 1) {
        const lastChunk = currentChunk.join(" ").trim();
        yield [lastChunk, await embed(lastChunk)];
        break;
      }

      const nextSentences = sentences.slice(i + 1, i + 1 + lookAhead);
      const shouldBreak = await decideBoundary(
        currentChunk,
        nextSentences,
      );

      if (shouldBreak) {
        const nextChunk = currentChunk.join(" ").trim();
        yield [nextChunk, await embed(nextChunk)];
        currentChunk = [];
      }
    }
  };
};

export default createAgenticChunker;

// // Example usage
// async function run() {
//   const sentences = [
//     "The quick brown fox jumps over the lazy dog.",
//     "This sentence is about something completely different.",
//     "Machine learning is a subset of artificial intelligence.",
//     "AI systems can process large amounts of data quickly.",
//     "Natural language processing is a key component of many AI applications.",
//   ];

//   for await (const chunk of agenticChunker(sentences, 2)) {
//     console.log("New chunk:");
//     chunk.forEach((item) => console.log(item.text));
//     console.log("---");
//   }
// }

// run().catch((error) => console.error("An error occurred:", error));
