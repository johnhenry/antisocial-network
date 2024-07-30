import type { Agent } from "@/types/mod";
import type { NextRequest } from "next/server";
import type { NextRoute } from "@/types/network";
import { mapAgentToAgentExt } from "@/lib/util/convert-types";

import { agent } from "@/lib/util/command";

export const POST: NextRoute = async (
  request: NextRequest,
) => {
  const target = request.headers.get("x-target") || undefined;
  const source = request.headers.get("x-source") || undefined;
  const name = request.headers.get("x-name") || undefined;
  try {
    const description = await request.text().then((text) => text.trim());
    if (!description) {
    }
    const a = mapAgentToAgentExt(
      await agent(
        ["create"],
        { description, target, source, temporary: false, quality: [], name },
        {},
      ) as Agent,
    );
    return new Response(JSON.stringify(a));
  } catch (e) {
    console.error(e);
    return new Response("error", { status: 400 });
  }
};
