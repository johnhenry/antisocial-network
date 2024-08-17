import type { Agent, Post } from "@/types/mod";
import { TABLE_POST } from "@/config/mod";
import { createFiles } from "@/lib/database/file";
import { createPost, stringIdToAgent } from "@/lib/database/post";
import { embed, summarize, tokenize } from "@/lib/ai";
import { getDB } from "@/lib/db";
import indenturedServant from "@/lib/util/indentured-savant";
import hash from "@/lib/util/hash";
import { tail } from "@/lib/util/forwards";
import { Handler } from "@/hashtags/types";
import consola from "@/lib/util/logging";
import { blankPost } from "@/lib/util/parse-post-content";

const DEFAULT_ROUNDS = 1;
const DEFAULT_STRATEGY = "mixture-of-agents";
const indent = indenturedServant(2);
const generatePrompt = (text: string) =>
  `# Enhanced Synthesized Response Prompt

You have been provided with a set of responses from various sources to a message:

${text}

Your task is to synthesize these responses into a single, high-quality response. Follow these steps:

1. Critically evaluate the information, recognizing potential biases, inaccuracies, or conflicts.
2. Synthesize a comprehensive, accurate response based on the most reliable information.
3. Provide a straightforward, no-nonsense answer as though addressing the user directly.
4. Follow your answer with reasoning, including references to specific sources when relevant.

Guidelines:
- Do not simply replicate the given answers.
- Ensure your response is well-structured, coherent, and accurate.
- When sources conflict, explain the discrepancy and justify your chosen stance.
- If information is uncertain or speculative, clearly indicate this in your
response.
- Stay within the scope of the provided information. If critical information is missing, state this clearly.
- Do not add an introduction or conclusion to your response.
- Format your response as a direct response to the given message.

Evaluation Criteria:
- Accuracy and reliability of information
- Comprehensiveness of the response
- Clarity and coherence of explanation
- Appropriate handling of conflicting or uncertain information
- Proper attribution to sources when necessary

Format:
- Your response should come in two parts
  – <synthesized response>: the synthesized respose as described.
  - <reasoning and justification>: Your reasoning and justififcation for the synthesized response, including, but not limited to the following:
    - Justification for your synthesis
    - discussion of any conflicting information
    - Explanation of uncertainty if present
    - References to specific sources where relevant

Format your response as follows:
\`\`\`
<synthesized response>

---
Reasoning and Justification

<reasoning and justification>

\`\`\`

Responses from sources:

\`
`;

export const advancedPrompting: Handler = async function* (
  CONTEXT,
) {
  const {
    source,
    target,
    original,
    dehydrated,
    simultaneous,
    query,
    depth,
    streaming,
    bibliography,
    name,
    files,
  } = CONTEXT;
  // Because the function may continue after running, we wrap int in a promise and ensure that resolve/reject is only called once.
  const db = await getDB();
  try {
    const forwards = [];
    const mentions = [];
    for (const sim of simultaneous) {
      const agent = await stringIdToAgent(sim[0] as string);
      mentions.push(agent);
      const forward = tail(sim);
      forwards.push(forward);
    }
    CONTEXT.simultaneous = forwards;
    const createdFiles = await createFiles({ files, owner: source });

    const [post] = await db.create(TABLE_POST, {
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
    CONTEXT.post = post;
    yield post;

    const params = Object.fromEntries(new URLSearchParams(query).entries());

    let rounds = Number(params.rounds) || DEFAULT_ROUNDS;
    const strategy = params.strategy || DEFAULT_STRATEGY;
    if (strategy !== DEFAULT_STRATEGY) {
      throw new Error(`Invalid strategy: ${strategy}`);
    }

    const layers = [];
    for (let i = 0; i < mentions.length; i++) {
      const source = mentions[i];
      const forward = forwards[i];
      const pendingPost = createPost([], {
        source,
        target: post,
        depth,
        streaming,
        bibliography,
        forward,
      });
      yield pendingPost as Promise<Post>;
      layers.push(pendingPost.then((pendingPost) => {
        return [pendingPost, source];
      }));
    }
    const responses = (await Promise.all(layers)).map(([post, agent]) => [
      (post as Post).content,
      (agent as Agent).id.toString(),
    ]);
    const text = responses.map(([content, id], index) =>
      `Response ${index}:
${indent`id:${id!}\n\n${content!}`}`
    )
      .join("\n\n");

    const prompt = generatePrompt(
      indent`${await blankPost(original, {
        mentions: true,
        hashtags: true,
      })}`,
    );

    const response = [
      await summarize(
        prompt,
        text,
      ),
    ];

    rounds -= 1;
    if (rounds > 0) {
      response.push(`${"\n".repeat(4)}${"-".repeat(2 ** 5)}${"\n".repeat(4)}
Think about how you would improve this response and give what you

#${name}?rounds=${rounds}&strategy=${strategy}
${mentions.map((x) => x.id.toString()).join(" ")}`);
    }

    const res = createPost(response.join(""), {
      source,
      target: post,
      depth,
      streaming,
      bibliography,
      forward: [],
      // forward: forwards.reduce((a, b) => merge(a as Forward, b as Forward), []),
    });
    yield res as Promise<Post>;
    if (rounds > 0) {
      if (rounds === 1) {
        console.info("Final round");
      } else {
        consola.info(`${rounds} rounds left.`);
      }
      console.info(((await res) as Post).content);
    } else {
      consola.info("Continuing");
    }
  } catch (e) {
    throw e;
  } finally {
    await db.close();
  }
};
export default advancedPrompting;
