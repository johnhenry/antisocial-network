export const dynamic = "force-dynamic";

import type { BaseMessageChunk } from "@langchain/core/messages";

import {
  createAgent,
  createFile,
  createFiles,
  createMeme,
} from "@/lib/database/create";
import { relate } from "@/lib/db";
type RouteOptions = {
  params: {
    params: string[];
  };
};

const parseSearchParams = (request) => {
  const searchParams = new URLSearchParams(new URL(request.url).search);
  let response = decodeURIComponent(searchParams.get("response") || "");
  try {
    response = JSON.parse(response);
  } catch {}
  let streaming: string | boolean = decodeURIComponent(
    searchParams.get("streaming") || "",
  );
  try {
    streaming = JSON.parse(streaming);
  } catch {}
  streaming = Boolean(streaming);
  const agent = decodeURIComponent(searchParams.get("agent") || "");
  const target = decodeURIComponent(searchParams.get("target") || "");
  const meme = decodeURIComponent(searchParams.get("meme") || "");
  return { response, streaming, agent, target, meme };
};

export const POST = async (request: Request, options: RouteOptions) => {
  try {
    const {
      params: {
        params: [entity, subject, origin, destination],
      },
    } = options;
    let body;
    try {
      body = await request.json();
    } catch (error: any) {
      body = undefined;
    }
    const { response, streaming, agent, target, meme } = parseSearchParams(
      request,
    );
    switch (entity) {
      case "meme": {
        const results = await createMeme(body || {}, {
          agent,
          response,
          target,
          streaming,
        });
        if (results.length === 0) {
          return new Response(null, { status: 204 });
        }
        if (response) {
          const ids = results.map(([id]) => id).join(",");
          const last = results[results.length - 1];
          let [_, content] = last;
          let body: string | ReadableStream<ArrayBuffer>;
          const ts = new TransformStream();
          if (streaming) {
            const writer = ts.writable.getWriter();
            body = ts.readable;
            setTimeout(async () => {
              for await (
                const chunk of content as AsyncGenerator<
                  BaseMessageChunk,
                  void,
                  unknown
                >
              ) {
                writer.write(chunk.content);
              }
              writer.close();
            });
          } else {
            body = content.content as string;
          }
          return new Response(body, {
            headers: { "x-id": ids },
          });
        } else {
          const [[id, content]] = results;
          return new Response(content as string, {
            headers: {
              "x-id": id,
            },
          });
        }
      }
      case "agent": {
        const [[id, content]] = await createAgent(body || {});
        return new Response(content as string, {
          headers: {
            "x-id": id,
          },
        });
      }
      case "file": {
        const [[id, content]] = await createFile(body, {
          agent,
          meme,
        });
        return new Response(content as string, {
          headers: {
            "x-id": id,
          },
        });
      }
      case "files": {
        const results = await createFiles(body, {
          agent,
          meme,
        });
        const ids = results.map(([id]) => id).join(",");
        const [[_, content]] = results;
        return new Response(content as string, {
          headers: {
            "x-id": ids,
          },
        });
      }
      case "relationship": {
        const result: any = await relate(origin, subject, destination, body); // TODO: find the type returne by Surreal DB relate
        return new Response(result);
      }
      default:
        throw new Error("Not found.");
    }
  } catch (error: any) {
    return new Response(error.message, { status: 404 });
  }
};
