import type { NextRoute } from "@/types/network";
import { getAgent } from "@/lib/database/agent";
import { StringRecordId } from "surrealdb.js";
import { mapAgentToAgentExt } from "@/lib/util/convert-types";

export const GET: NextRoute<{ id: string }> = async (
  _request: unknown,
  { params: { id } },
) => {
  // view single cron JOB
  const c = mapAgentToAgentExt(
    await getAgent(new StringRecordId(id)),
  );
  return new Response(JSON.stringify(c));
};
