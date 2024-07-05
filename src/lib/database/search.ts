"use server";
import { getDB } from "@/lib/db";
import { TABLE_MEME, TABLE_AGENT, TABLE_FILE, SIZE_KNN } from "@/settings";
import { embed } from "@/lib/ai";

export const search = async (
  search: "",
  {
    size = SIZE_KNN,
    tables = [TABLE_MEME, TABLE_AGENT, TABLE_FILE],
  }: { size?: number; tables?: string[] } = {}
): Promise<any[][]> => {
  const db = await getDB();
  try {
    const ADDITIONAL_FIELDS = `string::concat("", id) as id, IF source IS NOT NULL AND source IS NOT NONE THEN {id:string::concat("", source.id), name:source.name} ELSE NULL END AS source`;
    const OMIT_FIELDS = `embedding, data`;
    const embedded = search? await embed(search): undefined;
    const query = search? `SELECT *, vector::similarity::cosine(embedding, $embedded) AS dist, ${ADDITIONAL_FIELDS} OMIT ${OMIT_FIELDS} FROM type::table($table) WHERE embedding <|${size}|> $embedded ORDER BY dist DESC`:`SELECT *, ${ADDITIONAL_FIELDS} OMIT ${OMIT_FIELDS} FROM type::table($table) ORDER BY timestamp DESC Limit ${size}`;
    const final = [];
    for (const table of tables) {
      const [results]: [any[]] = await db.query(query, {
        table,
        embedded,
      });
      final.push(...results);
    }
    return final.sort((a, b) => a.timestamp - b.timestamp);
  } finally {
    await db.close();
  }
};

