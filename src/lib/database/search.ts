"use server";
import { getDB } from "@/lib/db";
import { TABLE_MEME, TABLE_AGENT, TABLE_FILE } from "@/settings";
import { embed } from "@/lib/ai";

export const searchMemes = async (
  search: string,
  {
    knn = 5,
    tables = [TABLE_MEME, TABLE_AGENT, TABLE_FILE],
  }: { knn?: number; tables?: string[] } = {}
): Promise<any[][]> => {
  const embedded = await embed(search);
  const db = await getDB();
  const query = `SELECT *, vector::similarity::cosine(embedding, $embedded) AS dist OMIT embedding FROM type::table($table) WHERE embedding <|${knn}|> $embedded ORDER BY dist DESC`;

  const final = [];
  for (const table of tables) {
    const [results]: [any[]] = await db.query(query, {
      table,
      embedded,
      knn,
    });
    final.push(results);
  }

  return final;
};