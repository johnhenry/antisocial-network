export const dynamic = "force-dynamic";

import { getFile, getFileByPath } from "@/lib/actions.file";

import base64to from "@/util/base64-to";
import { error } from "console";

export const GET = async (request, options) => {
  try {
    const { params } = options;
    const { searchParams } = new URL(request.url);
    const objectMode = searchParams.get("o");
    const pathMode = searchParams.get("p");
    const id = decodeURIComponent(params.id.join("/"));
    const file = pathMode ? await getFileByPath(id) : await getFile(id);
    const content = objectMode ? JSON.stringify(file) : base64to(file.content);
    console.log({ content });

    const contentType = objectMode ? "application/json" : file.type;
    return new Response(content, {
      headers: {
        "Content-Type": contentType,
      },
    });
  } catch (error) {
    console.error(error);
    return new Response("Not found.", { status: 404 });
  }
};
