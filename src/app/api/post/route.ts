import type { Post } from "@/types/mod";
import type { NextRequest } from "next/server";
import type { NextRoute } from "@/types/network";
import { mapPostToPostExt } from "@/lib/util/convert-types";

import { post } from "@/lib/util/command";

export const POST: NextRoute = async (
  request: NextRequest,
) => {
  // invoke create new cron job
  const target = request.headers.get("x-target") || undefined;
  const source = request.headers.get("x-source") || undefined;
  try {
    const content = await request.text().then((text) => text.trim());
    if (content) {
      const p = mapPostToPostExt(
        await post(
          ["create"],
          { content, target, source },
          {},
        ) as Post,
      );
      return new Response(JSON.stringify(p));
    } else {
      const p = mapPostToPostExt(
        await post(
          ["generate"],
          { target, source },
          {},
        ) as Post,
      );
      return new Response(JSON.stringify(p));
    }
  } catch (e) {
    return new Response("error", { status: 400 });
  }
};
