export const dynamic = "force-dynamic";

import {
  createMeme,
  createAgent,
  createFile,
  createFiles,
} from "@/lib/database/create";
import { relate } from "@/lib/db";
type RouteOptions = {
  params: {
    params: string[];
  };
};

export const POST = async (request: Request, options: RouteOptions) => {
  try {
    const {
      params: {
        params: [entity, subject, origin, destination],
      },
    } = options;
    const searchParams = new URLSearchParams(new URL(request.url).search);
    let body;
    try {
      body = await request.json();
    } catch (error: any) {
      body = undefined;
    }

    let response = decodeURIComponent(searchParams.get("response") || "");
    try {
      response = JSON.parse(response);
    } catch {}
    let streaming: string | boolean = decodeURIComponent(
      searchParams.get("streaming") || ""
    );
    try {
      streaming = JSON.parse(streaming);
    } catch {}
    streaming = Boolean(streaming);

    const agent = decodeURIComponent(searchParams.get("agent") || "");
    const target = decodeURIComponent(searchParams.get("target") || "");

    switch (entity) {
      case "meme": {
        const results = await createMeme(body || {}, {
          agent,
          response,
          target,
          streaming,
        });
        console.log({ results });

        if (response) {
          const ids = results.map(([id]) => id).join(",");
          const [[], [_, content]] = results;
          const ts = new TransformStream();
          let body = content;
          if (streaming) {
            const writer = ts.writable.getWriter();
            body = ts.readable;
            setTimeout(async () => {
              for await (const chunk of content) {
                writer.write(chunk.content);
              }
              writer.close();
            });
          }
          return new Response(body, {
            headers: { "x-id": ids },
          });
        } else {
          const [[id, content]] = results;
          return new Response(content, {
            headers: {
              "x-id": id,
            },
          });
        }

        switch (results.length) {
          case 2: {
            const ids = results.map(([id]) => id).join(",");
            const [[], [_, content]] = results;
            const ts = new TransformStream();
            // const writer = ts.writable.getWriter();
            // setTimeout(async () => {
            //   for await (const chunk of content) {
            //     writer.write(chunk.content);
            //   }
            //   writer.close();
            // });
            return new Response(ts.readable, {
              headers: { "x-id": ids },
            });
          }
          default: {
            const [[id, content]] = results;
            return new Response(content, {
              headers: {
                "x-id": id,
              },
            });
          }
        }
      }
      case "agent": {
        const id = await createAgent(body || {});
        return new Response(id);
      }
      case "file": {
        const id = await createFile(body, { agent });
        return new Response(id);
      }
      case "files": {
        const id = await createFiles(body, { agent });
        return new Response(id.join("\n"));
      }
      case "relationship": {
        const result = await relate(origin, subject, destination, body);
        return new Response(result);
      }
      default:
        throw new Error("Not found.");
    }
  } catch (error: any) {
    return new Response(error.message, { status: 404 });
  }
};
