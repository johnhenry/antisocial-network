import { createLog as originalCreateLog } from "@/lib/database/log";

jest.mock("@/lib/database/log", () => ({
  ...jest.requireActual("@/lib/database/log"),
  createLog: jest.fn(),
  sendNotification: jest.fn(),
}));

import createPost, { getConversation } from "@/lib/database/post";
import { deleteById } from "./test-helpers";
import { Agent, Post } from "@/types/mod";
import { TABLE_AGENT, TABLE_POST } from "@/config/mod";
import { createAgent } from "@/lib/database/agent";

describe("posts", () => {
  it("should be able to create a post", async () => {
    const post = (await createPost("hello world 3")) as Post;
    await deleteById(post.id);
  });

  it(
    "should be able to create a main post with 2 sub posts and get the conversation",
    async () => {
      const post = (await createPost("main post")) as Post;
      const post2 = (await createPost("sub post", { target: post })) as Post;
      const post3 = (await createPost("sub post 2", { target: post })) as Post;
      const conversation = await getConversation(post, -1);
      expect(conversation.length).toBe(3);
      await deleteById(post.id);
      await deleteById(post2.id);
      await deleteById(post3.id);
    },
    10000,
  );

  it(
    "should be able to ask an agent about previous things in the conversation from the parent post",
    async () => {
      const agent = (await createAgent({ name: "thoughtful-hippy" })) as Agent;

      const post = (await createPost(`the sky is green`, {})) as Post;
      const questionToAgentPost =
        (await createPost(`@${agent.id} are you alive?`, {
          target: post,
        })) as Post;

      const questionAboutQuestionPost = (await createPost(
        `@${agent.id} in this conversation what was the first thing i asked you?`,
        { target: post },
      )) as Post;

      const skyPost = (await createPost(
        `@${agent.id} what did someone previously say about the sky?`,
        { target: post },
      )) as Post;

      await deleteById(post.id);
      await deleteById(questionToAgentPost.id);
      await deleteById(questionAboutQuestionPost.id);
      await deleteById(skyPost.id);
    },
    30000,
  );
});