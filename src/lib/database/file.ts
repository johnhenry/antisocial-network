import exifr from "exifr";

import { Agent, File, FilePlus, FileProto, Post } from "@/types/mod";
import { TABLE_FILE } from "@/config/mod";
import {
  REL_BOOKMARKS,
  REL_CONTAINS,
  REL_INSERTED,
  REL_PRECEDES,
} from "@/config/mod";
import { getEntity, getLatest } from "@/lib/database/helpers";

import { getDB, relate } from "@/lib/db";

import { RecordId, StringRecordId } from "surrealdb.js";

import { getSettingsObject } from "@/lib/database/settings";
import createLog from "@/lib/database/log";

import createSentenceChunker from "@/lib/chunkers/sentence";

import { describe, embed, summarize } from "@/lib/ai";
import hash from "@/lib/util/hash";
import base64to from "@/lib/util/base64-to";
import parsePDF from "@/lib/parsers/pdf";

import { createPost } from "@/lib/database/post";

import { putObject } from "@/lib/fs/mod";

export const getFile = getEntity<File>;
export const getFiles = getLatest<File>(TABLE_FILE);

export const createFiles = async (
  { files, owner, chunk = true, logChunk = false }: {
    files: FileProto[];
    owner?: Agent;
    chunk?: boolean;
    logChunk?: boolean;
  },
): Promise<File[]> => {
  const ids: File[] = [];
  for (const file of files) {
    ids.push(await createFile({ file, owner, chunk, logChunk }));
  }
  return ids;
};

export const createFile = async (
  { file, owner, chunk = true, logChunk = false }: {
    file: FileProto;
    owner?: Agent;
    chunk?: boolean;
    logChunk?: boolean;
  },
): Promise<File> => {
  const db = await getDB();
  const { type, name, author, publisher, date, content } = file;

  try {
    let newFile: File;
    const buff = base64to(content as unknown as string);
    const [supertype, subtype] = type.split("/");
    switch (supertype) {
      case "text":
      case "application":
        {
          const settings = await getSettingsObject();
          let chunker;
          switch (settings.chunker) {
            case "sentence":
            case "agentic":
            case "semantic":
            default:
              chunker = createSentenceChunker();
              break;
          }
          let data, metadata, text;
          switch (subtype) {
            case "pdf": {
              data = buff.buffer as Buffer;
              ({ metadata, text } = await parsePDF(data));
              break;
            }
            default:
              {
                // assume text
                data = buff;
                text = new TextDecoder().decode(data);
              }
              break;
          }
          const summary = await summarize(text);
          const embedding = await embed(text);

          [newFile] = await db.create(TABLE_FILE, {
            timestamp: Date.now(),
            type,
            name,
            author,
            hash: hash(text),
            content: summary,
            embedding,
            metadata,
            publisher,
            date,
            owner: owner ? owner.id : undefined,
          }) as File[];

          if (chunk) {
            let previousPostId;
            // embed chunks
            for await (const [chunk, embedding] of chunker(text)) {
              const post = await createPost(chunk, {
                embedding,
                container: newFile,
                dropLog: !logChunk,
              }) as Post;
              await relate(newFile.id, REL_CONTAINS, post.id);
              if (previousPostId) {
                await relate(previousPostId, REL_PRECEDES, post.id, {
                  container: newFile,
                });
              }
              previousPostId = post.id;
            }
          }
        }
        break;
      case "image":
        {
          switch (subtype) {
            case "png":
            default: {
              const data = buff.buffer as Buffer;
              const summary = await describe(content.replace(/^[^,]+,/, ""));
              const embedding = await embed(summary);
              const metadata = await exifr.parse(data);
              [newFile] = await db.create(TABLE_FILE, {
                timestamp: Date.now(),
                type,
                name,
                author,
                hash: hash(buff as Buffer),
                content: summary,
                embedding,
                metadata,
                publisher,
                date,
                owner: owner ? owner.id : undefined,
              }) as File[];
            }
          }
        }
        break;
      default: {
        const data = buff.buffer as Buffer;
        let summary;
        try {
          summary = await describe(data.toString());
        } catch {
          summary = undefined;
        }
        const embedding = await embed(summary);
        const metadata = {};
        [newFile] = await db.create(TABLE_FILE, {
          timestamp: Date.now(),
          type,
          name,
          author,
          hash: hash(data),
          content: summary,
          embedding,
          metadata,
          publisher,
          date,
          owner: owner ? owner.id : undefined,
        }) as File[];
      }
    }
    if (owner) {
      await relate(owner.id, REL_INSERTED, newFile.id);
      await relate(owner.id, REL_BOOKMARKS, newFile.id);
    }
    if (!name) {
      // Update name to id
      await db.query(
        `UPDATE type::table($table) SET name = '${
          newFile.id.toString().split(":")[1]
        }' WHERE id = $id`,
        {
          table: TABLE_FILE,
          id: newFile.id,
        },
      );
    }
    await putObject(buff, { id: newFile.id.id as string });
    createLog(newFile);
    return newFile;
  } finally {
    await db.close();
  }
};

export const updateFile = async (
  id: StringRecordId,
  {
    name,
    author,
    publisher,
    date,
  }: {
    name?: string;
    author?: string;
    publisher?: string;
    date?: string;
  } = {},
): Promise<File> => {
  const db = await getDB();
  try {
    // get file
    const file = await db.select<File>(id);
    file.name = name;
    file.author = author;
    file.publisher = publisher;
    file.date = date;
    const newFile = await db.update<File>(id, file);
    return newFile;
  } finally {
    await db.close();
  }
};

export const getFilePlus = async (id: StringRecordId): Promise<FilePlus> => {
  const queries = [];
  const ADDITIONAL_FIELDS =
    `string::concat("", id) as id, IF source IS NOT NULL AND source IS NOT NONE THEN {id:string::concat("", source.id), name:source.name, hash:source.hash, image:source.image} ELSE NULL END AS source`;
  // select target
  queries.push(
    `SELECT *, ${ADDITIONAL_FIELDS} OMIT embedding, data FROM file where id = $id FETCH source, target.mentions, target.bibliography, target.source, mentions, mentions.bibliography, bibliography, bibliography.mentions`,
  );
  // select incoming relationships
  // precedes
  queries.push(
    `SELECT *, ${ADDITIONAL_FIELDS} OMIT embedding, data from agent where ->${REL_BOOKMARKS}->(file where id = $id)`,
  );

  // select outgoing relationships
  // excerpt
  queries.push(
    `SELECT *, ${ADDITIONAL_FIELDS} OMIT embedding, data from post where <-${REL_CONTAINS}<-(file where id = $id) ORDER BY RAND LIMIT 1`,
  );

  const db = await getDB();
  try {
    const [[file], bookmarkers, [excerpt]]: [[File], Agent[], [Post]] = await db
      .query(
        queries.join(";"),
        {
          id,
        },
      );
    const obj = {
      file,
      bookmarkers,
      excerpt,
    };
    return obj;
  } finally {
    await db.close();
  }
};
