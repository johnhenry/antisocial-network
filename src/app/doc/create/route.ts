import parsePDF from "@/lib/parsers/pdf";
import { createDoc } from "@/lib/actions.doc";

export const POST = async (request: Request) => {
  const type = request.headers.get("content-type");
  const [supertype, subtype] = (type || "").split("/");
  // const length = Number(request.headers.get("content-length"));
  const title = request.headers.get("x-filename");
  if (supertype === "application" || supertype === "text") {
    switch (subtype) {
      case "pdf":
        try {
          const { metadata, text } = await parsePDF(
            (await request.arrayBuffer()) as Buffer
          );
          const doc = await createDoc({ metadata, text, title, type });
          return new Response(JSON.stringify({ id: doc.id, metadata }), {
            headers: {
              "Content-Type": "application/json",
            },
          });
        } catch (error: any) {
          console.error(error.message);
        }
        return new Response(null, { status: 500 });
      case "markdown":
      case "javascript":
      case "python":
      case "typescript":
      // Handle Programming languages
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

  // return json
  return new Response(JSON.stringify({ id: "123" }), {
    headers: {
      "Content-Type": "application/json",
    },
  });
};
