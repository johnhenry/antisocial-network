import parsePDF from "@/lib/parsers/pdf";
import semanticChunker from "@/lib/chunkers/semantic";

export const POST = async (request: Request) => {
  const [type, subtype] = request.headers.get("content-type")!.split("/");
  const length = Number(request.headers.get("content-length"));
  const filename = request.headers.get("x-filename");
  if (type === "application" || type === "text") {
    switch (subtype) {
      case "pdf":
        try {
          console.log("parsing...");
          const { metadata, content } = await parsePDF(
            (await request.arrayBuffer()) as Buffer,
            semanticChunker
          );
          console.log({ metadata });
          console.log("chunking...");
          for await (const { chunk } of content) {
            console.log(chunk);
          }
          return new Response(JSON.stringify({ id: "123", metadata }), {
            headers: {
              "Content-Type": "application/json",
            },
          });
        } catch (error: any) {
          console.error(error.message);
        }
        return new Response(null, { status: 500 });
      case "json":
        return new Response(JSON.stringify({ id: "123" }), {
          headers: {
            "Content-Type": "application/json",
          },
        });
        break;
    }
  } else {
  }

  // retunr json
  return new Response(JSON.stringify({ id: "123" }), {
    headers: {
      "Content-Type": "application/json",
    },
  });
};
