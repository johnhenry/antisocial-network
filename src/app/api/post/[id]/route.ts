import type { NextRoute } from "@/types/network";
import { getPost } from "@/lib/database/post";
import { StringRecordId } from "surrealdb.js";
import { mapPostToPostExt } from "@/lib/util/convert-types";
export const GET: NextRoute<{ id: string }> = async (
  request: unknown,
  { params: { id } },
) => {
  // view single cron JOB
  const c = mapPostToPostExt(
    await getPost(new StringRecordId(id)),
  );
  return new Response(JSON.stringify(c));
};
