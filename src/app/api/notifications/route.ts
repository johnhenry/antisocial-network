import getWriteManager from "@/lib/write-space";
import { get } from "http";
import { send } from "process";
// Prevents this route's response from being cached on Vercel
export const dynamic = "force-dynamic";

export const GET = (request: Request) => {
  const encoder = new TextEncoder();
  // https://upstash.com/blog/sse-streaming-llm-responses

  const ts = new TransformStream();
  const writer = ts.writable.getWriter();
  const writeManager = getWriteManager();
  const writerId = writeManager.setWriter(writer);

  // let i = 0;
  // const interval = setInterval(() => {
  //   sendToWriters(`Hello ${i++}`);
  // }, 1000);

  request.signal.onabort = async () => {
    // clearInterval(interval);
    await writeManager.deleteWriter(writerId);
  };

  // Return the stream response and keep the connection alive
  return new Response(ts.readable, {
    // Set the headers for Server-Sent Events (SSE)
    headers: {
      Connection: "keep-alive",
      "Content-Encoding": "none",
      "Cache-Control": "no-cache, no-transform",
      "Content-Type": "text/event-stream; charset=utf-8",
    },
  });
};
