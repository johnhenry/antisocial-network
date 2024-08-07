import { updateSettings } from "@/lib/database/settings";
import { getSettings } from "@/lib/read";

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
