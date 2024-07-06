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
            <label key={name}>
              <input
                type="checkbox"
                name={name}
                defaultChecked={defaultValue}
              />
              <span>{label}</span>
            </label>
          );
        } else if (type === "select") {
          return (
            <label key={name}>
              <span>{label}</span>
              <select name={name} defaultValue={defaultValue}>
                {options.map((option) => (
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
      <h2>Agents</h2>
      <p>
        Click an agent's name to masquerade as that agent. When masquerading as
        an agent, posts and files that you create are associated with that
        agent.
      </p>
      <ul className="masquerade">
        {agents.map((agent: any) => {
          const masquerading = agent.id === masquerade?.id;

          const title = `${masquerading ? "🎭 masquerading as " : ""}@${
            agent.name
          }
----------------
${agent.id}
----------------
${agent.content}`;

          return (
            <li
              className={`masquerade-selector${
                masquerading ? " selected" : ""
              }`}
              title={title}
              key={agent.id}
            >
              <p
                className="name"
                onClick={() => {
                  masquerading ? setmasquerade(null) : setmasquerade(agent);
                }}
              >
                {agent.name}
              </p>
              <p>{truncate(agent.content, 64)}</p>
              <a href={`/agent/${agent.id}`}>↗</a>
            </li>
          );
        })}
      </ul>
      <hr />
      <h2>General Settings</h2>
      <SettingsForm
        settings={settings || []}
        ref={settingsFormRef}
        className="settings-form"
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
    </section>
  );
};

export default Page;
