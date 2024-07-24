"use client";
import type { Agent, Settings, Setting } from "@/types/mod";
import { useState, useEffect, useRef } from "react";
import truncate from "@/lib/util/truncate-string";
import useLocalStorage from "@/lib/hooks/use-localstorage";
import { clearDB } from "@/lib/db";
import { getSettings, updateSettings } from "@/lib/database/settings";

import obfo from "obfo";

const SettingsForm = ({
  settings,
  ref,
  className = "",
}: {
  settings: Setting[];
  ref: any;
  className: string;
}) => {
  return (
    <form data-obfo-container="{}" ref={ref} className={className}>
      {settings.map((setting: Setting) => {
        const { type, name, label, options, defaultValue } = setting;
        if (type === "checkbox") {
          return (
            <label key={name}>
              <input
                type="checkbox"
                name={name}
                data-obfo-case="checkbox"
                defaultChecked={Boolean(defaultValue)}
              />
              <span>{label}</span>
            </label>
          );
        } else if (type === "select") {
          return (
            <label key={name}>
              <span>{label}</span>
              <select name={name} defaultValue={defaultValue}>
                {options!.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          );
        } else {
          return (
            <label key={name}>
              <span>{label}</span>
              <input type={type} name={name} defaultValue={defaultValue} />
            </label>
          );
        }
      })}
    </form>
  );
};

const Page = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [settings, setSettings] = useState<Setting[]>([]);

  const settingsFormRef = useRef(null);
  const submitUpdateSettings = async () => {
    const data = obfo<Record<string, any>>(settingsFormRef.current!);
    settings.forEach((setting) => {
      const { name } = setting;
      if (data.hasOwnProperty(name)) {
        setting.defaultValue = data[name];
      }
    });
    await updateSettings(settings);
    alert("settings updated!");
  };
  const submitResetDatabase = async () => {
    const CONFIRMATION_WORD = "RESET";
    if (
      !(
        CONFIRMATION_WORD ===
        prompt(`Type "${CONFIRMATION_WORD}" to confirm database reset`)
      )
    ) {
      return alert(`Invalid confirmation word. Database will not be reset.`);
    }

    if (
      !confirm(
        "Please confirm one final time. There will be no chances to undo this action. Are you sure you want to reset the database?"
      )
    ) {
      return;
    }

    await clearDB();
    // Also clear local storage?
    alert("Database has been reset. Please reload page.");
  };
  useEffect(() => {
    const loadSettings = async () => {
      const settings: Setting[] = await getSettings();
      setSettings(settings);
    };
    loadSettings();
    return () => {};
  }, []);

  return (
    <article>
      <h2>Settings</h2>
      <SettingsForm
        settings={settings || []}
        ref={settingsFormRef}
        className="settings-box"
      />
      <button type="button" onClick={submitUpdateSettings}>
        Submit
      </button>
      <hr />
      <h2>Reset Database</h2>
      <p>
        Resetting the database may cause unforseen consequences. Please be
        careful before deleting.
      </p>
      <button type="button" onClick={submitResetDatabase}>
        ⚠️ Reset Database ⚠️
      </button>
      <hr />
    </article>
  );
};

export default Page;
