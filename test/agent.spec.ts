// you need to import the original function before replacing it
import { createLog as originalCreateLog } from "@/lib/database/log";
import { createLog as mockCreateLog } from "./log.mock";

// tests complain if there are console.logs after they finish
jest.mock("@/lib/database/log", () => ({
  ...jest.requireActual("@/lib/database/log"),
  createLog: mockCreateLog,
  sendNotification: jest.fn(),
}));

import { createAgent, deleteAgent, genCharacter } from "@/lib/database/agent";

describe("agent", () => {
  it("should generate a character with default parameters", async () => {
    const character = await genCharacter();
    expect(character.name).toBeDefined();
    expect(character.content).toBeDefined();
    expect(character.combinedQualities).toBeDefined();
  });

  it("should be able to create and delete an agent", async () => {
    const name = "test_agent";
    const result = await createAgent({ name });
    expect(result.id).toBeDefined();
    const deleteResult = await deleteAgent(result.id);
    expect(deleteResult).toBeTruthy();
  }, 10000);
});
