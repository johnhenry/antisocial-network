const DEFAULT_LEVELS = 3

import type {
  Agent,
  Entity,
  File,
  FileProto,
  LangchainGenerator,
  Post,
  PostPlus,
} from "@/types/mod";
import {TABLE_POST} from "@/config/mod";
import indenturedServant from "@/lib/util/indentured-savant";
const indent = indenturedServant(2);
import {blankPost} from "@/lib/util/parse-post-content-new";

import { embed, tokenize, summarize } from "@/lib/ai";
import {PROMPTS_SUMMARIZE} from "@/lib/templates/static";
import hash from "@/lib/util/hash";

import { Handler } from "@/hashtools/types";
import { getDB } from "@/lib/db";
import { stringIdToAgent, createPost } from "@/lib/database/post";
import {tail} from "@/lib/util/forwards";
export const mixtureOfAgents: Handler = ({source, target, dehydrated, simultaneous, params,  depth, streaming, bibliography, name}) => {
  return new Promise(async (rs, rj) => {
    let resolved = false;
    let rejected = false;
    const resolve = (post:any) => {
      if (!resolved) {
        rs(post);
        resolved = true;
      }
    };
    const reject = (e: unknown) => {
      if (!resolved) {
        rj(e);
        resolved = true;
        rejected = true;
      }
    };
    let post;
    const forwards = [];
    const sources = [];
    for(const sim of simultaneous){
      const source = await stringIdToAgent(sim[0] as string);
      sources.push(source);
      const forward = tail(sim);
      forwards.push(forward);
    }
    const db = await getDB();
    try{
        [post] = await db.create(TABLE_POST, {
          timestamp: Date.now(),
          content: `${dehydrated}`,
          embedding: await embed(dehydrated as string),
          count: tokenize(dehydrated as string).length,
          hash: hash(dehydrated as string),
          source: source ? source?.id : undefined,
          target: target ? target?.id : undefined,
          mentions: sources? sources.map(x=>x.id):undefined,
        }) as Post[];
      resolve({post, simultaneous});
    }catch(e){
      reject(e);
      throw e;
    }finally{
      await db.close();
    }
    let replaceRootMessage = await blankPost(dehydrated,{
      mentions:true,
      hashtags:true
    });
      let levels = Number(params.levels) || DEFAULT_LEVELS;
      const layers = [];
      for(let i = 0; i<sources.length; i++){
        const source = sources[i];
        const forward = forwards[i];
        const pendingPost = createPost(false, {source, target:post, depth, streaming, bibliography, forward, replaceRootMessage} );
        layers.push(pendingPost);
      }
      const responses = (await Promise.all(layers)).map(x=>(x as Post).content);
      let response = await summarize(
        responses.map((res, i)=>indent`${String(i+1)}. ${res!}`).join("\n"),
`You have been provided with a set of responses from various open-source models to the latest user query.
Your task is to synthesize these responses into a single, high-quality response.
It is crucial to critically evaluate the information provided in these responses, recognizing that some of it may be biased or incorrect.
Your response should not simply replicate the given answers but should offer a refined, accurate, and comprehensive reply to the instruction.
Ensure your response is well-structured, coherent, and adheres to the highest standards of accuracy and reliability.
Responses from models:`);

    levels -= 1;
    if(levels>0) {
response +=`\n\n
How would you improve this response?

#${name}?levels=${levels}
${sources.map(x=>x.id.toString()).join(" ")}`;
      }
    createPost(response, {source, target:post, depth, streaming, bibliography, forward: []});
    reject(new Error("MIXTURE OF AGENTS NOT IMPLEMENTED"));
  })
};
export default mixtureOfAgents;
