import type { Agent, Post } from "@/types/mod";
import { TABLE_POST } from "@/config/mod";
import { createFiles } from "@/lib/database/file";
import { createPost, stringIdToAgent } from "@/lib/database/post";
import { embed, summarize, tokenize } from "@/lib/ai";
import { getDB } from "@/lib/db";
import indenturedServant from "@/lib/util/indentured-savant";
import { blankPost } from "@/lib/util/parse-post-content";
import hash from "@/lib/util/hash";
import { tail } from "@/lib/util/forwards";
import { Handler } from "@/hashtags/types";

const DEFAULT_LEVELS = 1;
const indent = indenturedServant(2);
const generatePrompt = (text: string) =>
  `You have been provided with a set of responses from various sources to a query:
----------------

${text}

----------------
Your task is to synthesize these responses into a single, high-quality response.
It is crucial to critically evaluate the information provided in these responses, recognizing that some of it may be biased or incorrect.

Your response should not simply replicate the given answers but should offer a refined, accurate, and comprehensive reply to the instruction.
Ensure your response is well-structured, coherent, and adheres to the highest standards of accuracy and reliability.

Giva a straight-forward, no-nonsense answer formatted as though you were ddressing the user yourself. Do not format your response. Do not give it an introduction or a conclusion. Simply provide the answer.

Follow that up with reasoning for your answer including references to answers given by others if relevant.

Example:
'''
<Your response>

(<your reasoning behind your response>)
'''

Responses from models:
----------------

`;

export const mixtureOfAgents: Handler = (
  {
    source,
    target,
    dehydrated,
    simultaneous,
    params,
    depth,
    streaming,
    bibliography,
    name,
    files,
  },
) => {
  return new Promise(async (rs, rj) => {
    // Because the function may continue after running, we wrap int in a promise and ensure that resolve/reject is only called once.
    let resolved = false;
    const resolve = (post: any) => {
      if (!resolved) {
        rs(post);
        resolved = true;
      }
    };
    const reject = (e: unknown) => {
      if (!resolved) {
        rj(e);
        resolved = true;
      }
    };
    let post;
    const forwards = [];
    const mentions = [];
    for (const sim of simultaneous) {
      const agent = await stringIdToAgent(sim[0] as string);
      mentions.push(agent);
      const forward = tail(sim);
      forwards.push(forward);
    }
    const createdFiles = await createFiles({ files, owner: source });
    const db = await getDB();
    try {
      [post] = await db.create(TABLE_POST, {
        timestamp: Date.now(),
        content: dehydrated,
        embedding: await embed(dehydrated as string),
        count: tokenize(dehydrated as string).length,
        hash: hash(dehydrated as string),
        source: source ? source?.id : undefined,
        target: target ? target?.id : undefined,
        files: createdFiles.map((x) => x.id),
        mentions: mentions.map((x) => x.id),
      }) as Post[];
      resolve({ post });
    } catch (e) {
      reject(e);
      throw e;
    } finally {
      await db.close();
    }
    const replaceRootMessage = await blankPost(dehydrated, {
      mentions: true,
      hashtags: true,
    });

    let levels = Number(params.levels) || DEFAULT_LEVELS;
    const layers = [];
    for (let i = 0; i < mentions.length; i++) {
      const source = mentions[i];
      const forward = forwards[i];
      const pendingPost = createPost([["user", replaceRootMessage]], {
        source,
        target: post,
        depth,
        streaming,
        bibliography,
        forward,
        rewind: 1,
      });
      layers.push(pendingPost.then((pendingPost) => {
        return [pendingPost, source];
      }));
    }
    const responses = (await Promise.all(layers)).map(([post, agent]) => [
      (post as Post).content,
      (agent as Agent).id.toString(),
    ]);
    const text = responses.map(([content, id]) => indent`[${id!}] ${content!}`)
      .join("\n\n");

    const prompt = generatePrompt(indent`${dehydrated}`);

    let response = await summarize(
      text,
      prompt,
    );

    levels -= 1;
    if (levels > 0) {
      response += `${"\n".repeat(4)}${"-".repeat(2 ** 5)}${"\n".repeat(4)}
Think about how you would improve this response and give what you

#${name}?levels=${levels}
${mentions.map((x) => x.id.toString()).join(" ")}`;
    }
    createPost(response, {
      source,
      target: post,
      depth,
      streaming,
      bibliography,
      forward: [],
      // forward: forwards.reduce((a, b) => merge(a as Forward, b as Forward), []),
    });
  });
};
export default mixtureOfAgents;
