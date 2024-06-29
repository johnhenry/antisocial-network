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

    const agent = decodeURIComponent(searchParams.get("agent") || "");
    const target = decodeURIComponent(searchParams.get("target") || "");
    let response = decodeURIComponent(searchParams.get("response") || "");
    try {
      response = JSON.parse(response);
    } catch {}

    switch (entity) {
      case "meme": {
        const id = await createMeme(body || {}, { agent, response, target });
        return new Response(id);
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
        console.log(result);
        return new Response(result);
      }
      default:
        throw new Error("Not found.");
    }
  } catch (error: any) {
    return new Response(error.message, { status: 404 });
  }
};
