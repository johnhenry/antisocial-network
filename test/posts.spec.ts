import { describe, expect, it } from "@jest/globals";
import createPost, { getConversation } from "@/lib/database/post";
import { deleteEntityById } from "@/lib/database/helpers";
import { Agent, Post } from "@/types/mod";
import { createAgent } from "@/lib/database/agent";
jest.mock("@/lib/database/log", () => ({
  ...jest.requireActual("@/lib/database/log"),
  createLog: jest.fn(),
  sendNotification: jest.fn(),
}));

describe("posts", () => {
  it("should be able to create a post", async () => {
    const post = (await createPost("hello world 3")) as Post;
    await deleteEntityById(post.id);
  });
  it(
    "should be able to create a main post with 2 sub posts and get the conversation",
    async () => {
      const post = (await createPost("main post")) as Post;
      const post2 = (await createPost("sub post", { target: post })) as Post;
      const post3 = (await createPost("sub post 2", { target: post2 })) as Post;
      const conversation = await getConversation(post3);
      expect(conversation.length).toBe(1);
      expect(conversation.flat(Infinity).length).toBe(3);
      // converations have a root node. We''l have to modify this to recursively check.
      await deleteEntityById(post.id);
      await deleteEntityById(post2.id);
      await deleteEntityById(post3.id);
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
      // Note, because items depend upon eachother, they must be deleted in reverse order of creation
      await deleteEntityById(skyPost.id);
      await deleteEntityById(questionAboutQuestionPost.id);
      await deleteEntityById(questionToAgentPost.id);
      await deleteEntityById(post.id);
    },
    30000,
  );
});
