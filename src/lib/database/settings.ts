"use server";

import type { Setting } from "@/types/mod";
import { StringRecordId } from "surrealdb.js";
import { getDB } from "@/lib/db";
import { SETTINGS_DEFAULT } from "@/config/mod";

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
  Record<string, string | number | boolean | undefined>
> => {
  const protoSettings: Setting[] = await getSettings();
  // transform into object with name:defaultValue
  const settings = protoSettings.reduce((acc, setting) => {
    acc[setting.name] = setting.defaultValue;
    return acc;
  }, {} as Record<string, string | number | boolean | undefined>);
  return settings || {};
};

const castAsNumber = [
  "embedding_vector_size",
];
const castAsBoolean: string[] = [];

export const updateSettings = async (
  settings: Setting[],
  partial = true,
): Promise<Setting[]> => {
  const db = await getDB();
  try {
    const newSettings: Setting[] = [];
    for (const setting of settings) {
      const clonedSetting = { ...setting };
      if (castAsNumber.includes(clonedSetting.name)) {
        setting.defaultValue = Number(clonedSetting.defaultValue);
      }
      if (castAsBoolean.includes(clonedSetting.name)) {
        clonedSetting.defaultValue =
          (clonedSetting.defaultValue as string).toLowerCase() === "true"
            ? true
            : false;
      }
      newSettings.push(clonedSetting);
    }
    // Fetch current settings
    await db.update(new StringRecordId("settings:current"), {
      data: newSettings,
      updated_at: new Date().toISOString(),
    });
    return newSettings;
  } catch (error) {
    console.error("Error updating settings:", error);
    return [];
  } finally {
    // Close the connection
    db.close();
  }
};

export const updateSettingsObject = async (
  settings: Record<string, string | number | boolean | undefined>,
): Promise<Setting[]> => {
  const db = await getDB();
  try {
    const newSettings: Setting[] = [];
    const oldSettings = await getSettings();
    for (const [name, value] of Object.entries(oldSettings)) {
      const setting = oldSettings.find((s) => s.name === name)!;
      const newSetting = { ...setting };
      if (newSetting) {
        if (value !== null) {
          newSetting.defaultValue = value.defaultValue;
        } else {
          const originalSetting = SETTINGS_DEFAULT.find((s) => s.name === name);
          newSetting.defaultValue = originalSetting?.defaultValue || undefined;
        }
        newSettings.push(newSetting);
      }
    }
    // Fetch current settings
    await db.update(new StringRecordId("settings:current"), {
      data: newSettings,
      updated_at: new Date().toISOString(),
    });
    return newSettings;
  } catch (error) {
    console.error("Error updating settings:", error);
    return [];
  } finally {
    // Close the connection
    db.close();
  }
};
