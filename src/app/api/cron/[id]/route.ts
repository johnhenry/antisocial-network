import type { NextRequest, NextResponse } from "next/server";
import {
  createCron,
  getAllCron,
  getCron,
  invokeCron,
} from "@/lib/database/cron";
import { RecordId, StringRecordId } from "surrealdb.js";
import { mapCronToCronExt } from "@/lib/util/convert-types";
type R = Promise<Response | NextResponse> | Response | NextResponse;
type NextRoute<T = unknown> = (
  request: NextRequest,
  { params }: { params: T },
) => R;

export const GET: NextRoute<{ id?: string }> = async (
  request: NextRequest,
  { params: { id } },
) => {
  if(id==="schedules"){
    const crons = await getAllCron();
    return new Response(JSON.stringify(Object.fromEntries(
      crons
      .map(mapCronToCronExt).map(({id,on, schedule})=>[`http://localhost:3000/api/cron/${id}`, on ? schedule : ""]))));
  }

  // view single cron
  if (id) {
    const cron = mapCronToCronExt(
      await getCron(new StringRecordId(id) as unknown as RecordId),
    );
    return new Response(JSON.stringify(cron));
  }
  // view all cron
  return new Response(
    JSON.stringify((await getAllCron()).map(mapCronToCronExt)),
  );
};

export const POST: NextRoute<{ id?: string }> = async (
  request: NextRequest,
  { params: { id } },
) => {
  // invoke cron
  if (id) {
    const cron = mapCronToCronExt(
      await invokeCron(new StringRecordId(id) as unknown as RecordId),
    );
    return new Response(JSON.stringify(cron));
  }
  // create new cron
  const newCron = await request.json();
  const cron = mapCronToCronExt(await createCron(newCron));
  return new Response(JSON.stringify(cron));
};

