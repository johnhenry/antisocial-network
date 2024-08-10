import type { Cron } from "@/types/mod";
import type { NextRequest } from "next/server";
import type { NextRoute } from "@/types/network";
import { getAllCron } from "@/lib/database/cron";
import { mapCronToCronExt } from "@/lib/util/convert-types";

import { cron } from "@/lib/util/command";

export const GET: NextRoute = async (
  _request: unknown,
) => {
  // view all cron jobs
  return new Response(
    JSON.stringify((await getAllCron()).map(mapCronToCronExt)),
  );
};

export const POST: NextRoute = async (
  request: NextRequest,
) => {
  // invoke create new cron job
  const schedule = await request.json();
  const target = request.headers.get("x-target") || undefined;
  const source = request.headers.get("x-source") || undefined;
  try {
    mapCronToCronExt(
      await cron(
        ["create", schedule.schedule],
        { content: schedule.content, target, source },
        {},
      ) as Cron,
    );
    return new Response(JSON.stringify(cron), { status: 201 });
  } catch (e) {
    return new Response("error", { status: 400 });
  }
};
