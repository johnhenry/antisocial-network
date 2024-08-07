import { describe, expect } from "@jest/globals";
import { embed, respond, summarize } from "@/lib/ai";
import { createAgent, genCharacter } from "@/lib/database/agent";
import { updateSettings } from "@/lib/database/settings";
import { getSettings } from "@/lib/read";

describe("ai", () => {
  it("should be able to create an embedding using ollama", async () => {
    await updateModelEmbeddingSetting("ollama::nomic-embed-text:latest");

    const output = await embed("hello world");
    expect(output).toBeTruthy();
  });

  it("should be able to create an embedding using openai", async () => {
    await updateModelEmbeddingSetting("openai::text-embedding-3-large");

    const output = await embed("hello world");
    expect(output).toBeTruthy();
  });

  it("should be able to respond to a prompt", async () => {
    const output = await respond({
      messages: [["user", "What is the weather like today?"]],
    });
    expect(output).toBeTruthy();
  });

  it("should be able to summarize content", async () => {
    const output = await summarize(
      "Hello, this is a test. Hello, this is also a test",
    );
    expect(output).toBeTruthy();
  });
});

describe("agent", () => {
  it("should generate a character with default parameters", async () => {
    const character = await genCharacter();
    expect(character.name).toBeDefined();
    expect(character.content).toBeDefined();
    expect(character.combinedQualities).toBeDefined();
  });

  it("should be able to create an agent", async () => {
    const name = "test_agent";
    const result = await createAgent({ name });
  });
});

describe("posts", () => {
  it("should be able to create a post", async () => {
  });
});

const updateModelEmbeddingSetting = async (newModelEmbedding: string) => {
  const settings = await getSettings();
  const modelEmbedding = settings.find((s) => s.name === "modelembedding");

  if (modelEmbedding) {
    modelEmbedding.defaultValue = newModelEmbedding;
    await updateSettings(settings);
  }
};
