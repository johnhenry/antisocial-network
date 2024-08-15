import getWriteManager from "@/lib/write-space";

// Prevents this route's response from being cached on Vercel
export const dynamic = "force-dynamic";

export const GET = (request: Request) => {
  // https://upstash.com/blog/sse-streaming-llm-responses
  const ts = new TransformStream();
  const writer = ts.writable.getWriter();
  const writeManager = getWriteManager();
  const writerId = writeManager.setWriter(writer);
  request.signal.onabort = async () => {
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

export const POST = async (request: Request) => {
  const json = await request.json();
  getWriteManager().sendToWriters(JSON.stringify(json));
  // Return the stream response and keep the connection alive
  return new Response("ok");
};
