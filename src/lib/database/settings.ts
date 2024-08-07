"use server";

import type { Setting } from "@/types/mod";
import { StringRecordId } from "surrealdb.js";
import { getDB } from "@/lib/db";

export const getSettings = async (): Promise<Setting[]> => {
  const db = await getDB();
  try {
    // Fetch current settings
    const currentSettings = (await db.select(
      new StringRecordId("settings:current"),
    )) as unknown as { data: Setting[] };
    return currentSettings.data;
  } catch (error) {
    console.error("Error reading settings:", error);
    return [];
  } finally {
    // Close the connection
    db.close();
  }
};

export const getSettingsObject = async (): Promise<
  Record<string, string | undefined>
> => {
  const protoSettings: Setting[] = await getSettings();
  // transform into object with name:defaultValue
  const settings = protoSettings.reduce((acc, setting) => {
    acc[setting.name] = setting.defaultValue;
    return acc;
  }, {} as Record<string, string | undefined>);
  return settings || {};
};

const castAsNumber = [
  "embedding_vector_size",
];
const castAsBoolean: string[] = [];

export const updateSettings = async (
  settings: Setting[],
): Promise<Setting[]> => {
  const db = await getDB();
  try {
    for (const setting of settings) {
      if (castAsNumber.includes(setting.name)) {
        setting.defaultValue = Number(setting.defaultValue);
      }
      if (castAsBoolean.includes(setting.name)) {
        setting.defaultValue =
          (setting.defaultValue as string).toLowerCase() === "true"
            ? true
            : false;
      }
    }
    // Fetch current settings
    await db.update(new StringRecordId("settings:current"), {
      data: settings,
      updated_at: new Date().toISOString(),
    });
    return settings;
  } catch (error) {
    console.error("Error updating settings:", error);
    return [];
  } finally {
    // Close the connection
    db.close();
  }
};
