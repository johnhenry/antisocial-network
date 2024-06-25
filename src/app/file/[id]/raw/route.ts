export const dynamic = "force-dynamic";

import { getFile } from "@/lib/database/read";

import base64to from "@/util/base64-to";

export const GET = async (_, options) => {
  try {
    const { params } = options;
    const identifier = decodeURIComponent(params.id || "");
    const result = await getFile(identifier);
    const { type, data } = result;
    return new Response(base64to(data as string), {
      headers: {
        "Content-Type": type,
      } as HeadersInit,
    });
  } catch (error) {
    console.error(error);
    return new Response("Not found.", { status: 404 });
  }
};
