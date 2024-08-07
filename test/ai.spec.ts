describe("place holder", () => {
  it("should hold the pace", async () => {
    expect(true).toBeTruthy();
  });
});

// import { describe, expect, it } from "@jest/globals";
// import { embed, respond, summarize } from "@/lib/ai";
// import { updateSettingsObject } from "@/lib/database/settings";

// describe("ai", () => {
//   it("should be able to create an embedding using ollama", async () => {
//     await (updateSettingsObject({
//       "modelembedding": "ollama::nomic-embed-text:latest",
//     }));
//     const output = await embed("hello world");
//     expect(output).toBeTruthy();
//   });

//   it("should be able to create an embedding using openai", async () => {
//     await (updateSettingsObject({
//       "modelembedding": "ollama::nomic-embed-text:latest",
//     }));
//     const output = await embed("hello world");
//     expect(output).toBeTruthy();
//   });

//   it("should be able to respond to a prompt", async () => {
//     const output = await respond({
//       messages: [["user", "What is the weather like today?"]],
//     });
//     expect(output).toBeTruthy();
//   });

//   it("should be able to summarize content", async () => {
//     const output = await summarize(
//       "Hello, this is a test. Hello, this is also a test",
//     );
//     expect(output).toBeTruthy();
//   });
// });
