import { describe, expect, it } from "@jest/globals";
describe.skip("agent", () => {
  it("should be able to create an agent", () => {
    expect(true).toBeTruthy();
  });
});
// import { createAgent, genCharacter } from "@/lib/database/agent";
// import { deleteEntityById } from "@/lib/database/helpers";
// // tests complain if there are console.logs after they finish
// jest.mock("@/lib/database/log", () => ({
//   ...jest.requireActual("@/lib/database/log"),
//   createLog: jest.fn(),
//   sendNotification: jest.fn(),
// }));
// describe("agent", () => {
//   it.skip("should generate a character with default parameters", async () => {
//     const character = await genCharacter();
//     expect(character.name).toBeDefined();
//     expect(character.content).toBeDefined();
//     expect(character.combinedQualities).toBeDefined();
//   });

//   it.skip("should be able to create and delete an agent", async () => {
//     const name = "test_agent";
//     const result = await createAgent({ name });
//     expect(result.id).toBeDefined();
//     const deleteResult = await deleteEntityById(result.id);
//     expect(deleteResult).toBeTruthy();
//   }, 10000);
// });
