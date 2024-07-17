import { Agent, File, ProtoFile, Tool } from "@/types/mod";
import { TABLE_FILE } from "@/config/mod";

import { getDB } from "@/lib/db";

export const createFiles = async (
  { files, source }: { files: ProtoFile[]; source?: Agent },
): Promise<File[]> => {
  const ids: File[] = [];
  for (const file of files) {
    ids.push(await createFile({ file, source }));
  }
  return ids;
};

export const createFile = async (
  { file: protoFile, source }: { file: ProtoFile; source?: Agent },
): Promise<File> => {
  throw new Error("TODO: Implement");
  const db = await getDB();
  try {
    let file;
    [file] = await db.create(TABLE_FILE, {}) as File[];

    const [supertype, subtype] = protoFile.type.split("/");
    switch (supertype) {
      case "text":
      case "application":
        {
          switch (subtype) {
            case "plain":
            case "text":
              {
              }
              break;
            case "pdf": {
            }
          }
        }
        break;
      case "image":
        {
          switch (subtype) {
            case "png":
              {
              }
              break;
            case "jpg": {
            }
          }
        }
        break;
    }

    return file;
  } finally {
    await db.close();
  }
};
