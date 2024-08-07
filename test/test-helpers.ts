import { updateSettings } from "@/lib/database/settings";
import { getDB } from "@/lib/db";
import { getSettings } from "@/lib/read";
import { RecordId } from "surrealdb.js";

export const updateModelEmbeddingSetting = async (
  newModelEmbedding: string,
) => {
  const settings = await getSettings();
  const modelEmbedding = settings.find((s) => s.name === "modelembedding");

  if (modelEmbedding) {
    modelEmbedding.defaultValue = newModelEmbedding;
    await updateSettings(settings);
  }
};

export const deleteById = async (recordId: RecordId): Promise<boolean> => {
  const db = await getDB();
  try {
    const response = await db.delete(recordId);
    return true;
  } catch (err) {
    return false;
  } finally {
    db.close();
  }
};
