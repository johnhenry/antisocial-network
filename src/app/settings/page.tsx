"use client";
import type { Agent, Settings, Setting } from "@/types/types";
import { getAllAgents } from "@/lib/database/read";
import { useState, useEffect, useRef } from "react";
import truncate from "@/util/truncate-string";
import { MASQUERADE_KEY } from "@/settings";
import useLocalStorage from "@/lib/hooks/use-localstorage";
import { clearDB } from "@/lib/db";
import { getSettings } from "@/lib/database/read";
import { updateSettings } from "@/lib/database/update";

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
            <div key={name}>
              <label>
                <input
                  type="checkbox"
                  name={name}
                  defaultChecked={defaultValue}
                />
                {label}
              </label>
            </div>
          );
        } else if (type === "select") {
          return (
            <div key={name}>
              <label>{label}</label>
              <select name={name} defaultValue={defaultValue}>
                {options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          );
        } else {
          return (
            <div key={name}>
              <label>{label}</label>
              <input type={type} name={name} defaultValue={defaultValue} />
            </div>
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
    const data = obfo(settingsFormRef.current);
    settings.forEach((setting) => {
      const { name } = setting;
      if (data.hasOwnProperty(name)) {
        setting.defaultValue = data[name];
      }
    });
    await updateSettings(settings);
    alert("settings updated!");
  };
  // const [masquerade, setmasquerade] = useState<Agent | null>(null);
  const [masquerade, setmasquerade] = useLocalStorage<Agent | null>(
    MASQUERADE_KEY,
    null
  );
  const submitResetDatabase = async () => {
    if (!confirm("Are you sure you want to reset the database?")) {
      return;
    }
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
      return alert(`Database will not be reset.`);
    }

    await clearDB();
    // Also clear local storage?
    alert("Database has been reset. Please reload page.");
  };
  useEffect(() => {
    const loadAgents = async () => {
      const agents = await getAllAgents();
      setAgents(agents);
    };
    const loadSettings = async () => {
      const settings: Setting[] = await getSettings();
      setSettings(settings);
    };
    loadAgents();
    loadSettings();
    return () => {};
  }, []);

  return (
    <section>
      <h1>Settings</h1>

      <hr />
      <h2>Settings</h2>
      <SettingsForm settings={settings || []} ref={settingsFormRef} />
      <button type="button" onClick={submitUpdateSettings}>
        Submit
      </button>
      <hr />
      <h2>Masquerade</h2>
      <ul className="search-results-b">
        {masquerade === null ? (
          agents.map((agent: any) => (
            <li
              className=""
              key={agent.id}
              onClick={() => setmasquerade(agent)}
            >
              <p className="name">{agent.name}</p>
              <p>{truncate(agent.content, 80)}</p>
            </li>
          ))
        ) : (
          <li
            className=""
            key={masquerade.id}
            onClick={() => setmasquerade(null)}
          >
            🎭 Masquerading as: <p className="name">{masquerade.name}</p>
            <p>{truncate(masquerade.content, 80)}</p>
          </li>
        )}
      </ul>
      <hr />

      <h2>Reset Database</h2>
      <button type="button" onClick={submitResetDatabase}>
        ⚠️ Reset Database ⚠️
      </button>
      <hr />
    </section>
  );
};

export default Page;
