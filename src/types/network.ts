import type { NextRequest, NextResponse } from "next/server";

type R = Promise<Response | NextResponse> | Response | NextResponse;
export type NextRoute<T = unknown> = (
  request: NextRequest,
  { params }: { params: T },
) => R;
