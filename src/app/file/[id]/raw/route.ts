import { getFile } from "@/lib/database/file";
import { getObject } from "@/lib/fs/mod";

import { StringRecordId } from "surrealdb.js";

type GETOptions = {
  params: {
    id: string;
  };
};

export const GET = async (_: unknown, options: GETOptions) => {
  try {
    const { params } = options;
    const identifier = decodeURIComponent(params.id || "");
    const [__, id] = identifier.split(":");
    const file = await getFile(new StringRecordId(identifier));
    const data = await getObject(id);
    return new Response(data as unknown as string, {
      headers: {
        "Content-Type": file.type,
      },
    });
  } catch (error) {
    console.error(error);
    return new Response("Not found.", { status: 404 });
  }
};
