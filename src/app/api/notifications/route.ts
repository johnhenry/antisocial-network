import { TABLE_LOG } from "@/config/mod";
import { getDB } from "@/lib/db";
import getWriteManager from "@/lib/write-space";

// Prevents this route's response from being cached on Vercel
export const dynamic = "force-dynamic";
export { getWriteManager };
export const GET = (request: Request) => {
  const encoder = new TextEncoder();
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

// export const GET = async (request: Request) => {
//   // The uuid of the live query will be returned

//   const db = await getDB();
//   const encoder = new TextEncoder();
//   // https://upstash.com/blog/sse-streaming-llm-responses
//   const ts = new TransformStream();
//   const writer = ts.writable.getWriter();
//   const queryUuid = await db.live(
//     TABLE_LOG,
//     (action, result) => {
//       if (action === "CREATE") {
//         console.log({ result });
//         writer.write(encoder.encode(`data: ${JSON.stringify(result)}\n\n`));
//       }
//     },
//   );
//   try {
//     request.signal.onabort = async () => {
//       await writer.close();
//       db.kill(queryUuid);
//     };
//     return new Response(ts.readable, {
//       // Set the headers for Server-Sent Events (SSE)
//       headers: {
//         Connection: "keep-alive",
//         "Content-Encoding": "none",
//         "Cache-Control": "no-cache, no-transform",
//         "Content-Type": "text/event-stream; charset=utf-8",
//       },
//     });
//   } finally {
//     db.close();
//   }
// };
