import { File } from "@/types/mod";
import { getFile } from "@/lib/database/file";
import { getObject, getObjectFull } from "@/lib/fs/mod";
import { NextRequest } from "next/server";
import sharp from "sharp";
import { StringRecordId } from "surrealdb.js";

type GETOptions = {
  params: {
    id: string;
  };
};

const getTransformer =
  (options: string, file: File) => async (data: Buffer): Promise<Buffer> => {
    return new Promise((resolve) => {
      const opts = options.split(",").reduce((acc, curr) => {
        const [key, value] = curr.split(":");
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);
      if (file.type.startsWith("image/")) {
        switch (opts.type) {
          case "resize": {
            const params: Record<string, number> = {};
            params.width = parseInt(opts.width);
            params.height = parseInt(opts.height);
            return sharp(data)
              .resize(params)
              .toBuffer()
              .then(resolve);
          }
          default: {
            return resolve(data);
          }
        }
      }
      return data;
    });
  };

export const GET = async (request: NextRequest, options: GETOptions) => {
  try {
    const { params } = options;
    const identifier = decodeURIComponent(params.id || "");
    const [_, id] = identifier.split(":");
    const file = await getFile(new StringRecordId(identifier));
    const protoRange = request.headers.get("Range");
    let offset, length;
    if (protoRange) {
      [, offset, length] = /Range: bytes=(\d+)-?(\d*)/.exec(protoRange) || [];
      [offset, length] = [offset, length].map((s) => parseInt(s as string))
        .filter((x) => !Number.isNaN(x));
    }
    const transform = request.nextUrl.searchParams.get(`transform`);
    let data;
    if (transform) {
      data = await getObjectFull(id, await getTransformer(transform, file));
    } else {
      data = await getObject(id, offset, length);
    }
    // request.headers.get("Accept-Encoding") === "gzip";
    return new Response(data as unknown as string, {
      headers: {
        "Content-Type": file.type,
      },
    });
  } catch (error) {
    ``;
    console.error("ERROR", error);
    return new Response("Not found.", { status: 404 });
  }
};
