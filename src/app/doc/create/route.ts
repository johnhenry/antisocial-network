import parsePDF from "@/lib/parsers/pdf";
import semanticChunker from "@/lib/chunkers/semantic";
import { createMeme, setRelationshipProceeds } from "@/lib/actions.meme";
import { createDoc, setRelationshipContains } from "@/lib/actions.doc";

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
          const doc = await createDoc({ metadata });
          console.log(doc);
          let previousMemeId = null;
          for await (const { chunk, embedding } of content) {
            const meme = await createMeme(chunk, embedding);
            console.log(meme);
            await setRelationshipContains(doc.id, meme.id);
            if (previousMemeId) {
              await setRelationshipProceeds(previousMemeId, meme.id);
            }
            previousMemeId = meme.id;
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

  // return json
  return new Response(JSON.stringify({ id: "123" }), {
    headers: {
      "Content-Type": "application/json",
    },
  });
};
