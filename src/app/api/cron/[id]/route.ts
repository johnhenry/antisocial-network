import type { NextRequest } from "next/server";
import type { NextRoute } from "@/types/network";
import type { Cron } from "@/types/mod";
import {
  createCron,
  getAllCron,
  getCron,
  invokeCron,
} from "@/lib/database/cron";
import { RecordId, StringRecordId } from "surrealdb.js";
import { mapCronToCronExt } from "@/lib/util/convert-types";

import { cron } from "@/lib/util/command";

export const GET: NextRoute<{ id: string }> = async (
  request: unknown,
  { params: { id } },
) => {
  if (id === "schedules") {
    const crons = await getAllCron();
    return new Response(JSON.stringify(Object.fromEntries(
      crons
        .map(mapCronToCronExt).map((
          { id, on, schedule },
        ) => [`http://localhost:3000/api/cron/${id}`, on ? schedule : ""]),
    )));
  }

  // view single cron JOB
  const cron = mapCronToCronExt(
    await getCron(new StringRecordId(id) as unknown as RecordId),
  );
  return new Response(JSON.stringify(cron));
};

export const POST: NextRoute<{ id: string }> = async (
  request: NextRequest,
  { params: { id } },
) => {
  // invoke cron
  const target = request.headers.get("x-target") || undefined;
  const source = request.headers.get("x-source") || undefined;

  try {
    const targetCron = await cron(["fire", id], { source, target }, {});
    if (!(targetCron as Cron).on) {
      return new Response("gone", { status: 410 });
    }
    return new Response(JSON.stringify(cron));
  } catch (e) {
    return new Response("error", { status: 400 });
  }
};

export const PATCH: NextRoute<{ id: string }> = async (
  request: NextRequest,
  { params: { id } },
) => {
  // invoke cron

  try {
    const { state } = await request.json();
    const off = !state ||
      state.toLowerCase() === "off" ||
      state.toLowerCase() === "false";
    const targetCron = await cron(["setstate", id], { off }, {});
    if (!(targetCron as Cron).on) {
      return new Response("gone", { status: 410 });
    }
    return new Response(JSON.stringify(cron));
  } catch (e) {
    return new Response("error", { status: 400 });
  }
};
