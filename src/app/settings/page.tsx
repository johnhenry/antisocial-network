"use client";
import type { Agent } from "@/types/types";
import { getAllAgents } from "@/lib/database/read";
import { useState, useEffect } from "react";
import truncate from "@/util/truncate-string";
import { MASQUERADE_KEY } from "@/settings";
import useLocalStorage from "@/lib/hooks/use-localstorage";

const Page = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  // const [masquerade, setMasquerade] = useState<Agent | null>(null);
  const [masquerade, setMasquerade] = useLocalStorage<Agent | null>(
    MASQUERADE_KEY,
    null
  );
  const initializeDababase = async () => {
    const response = await fetch("/settings/initialize-database", {
      method: "POST",
    });
    const text = await response.text();
    if (response.ok) {
      alert(`${text}`);
    } else {
      alert(`Database failed to initialize: ${text}`);
    }
  };
  getAllAgents;
  useEffect(() => {
    const loadAgents = async () => {
      const agents = await getAllAgents();
      setAgents(agents);
    };
    loadAgents();
    return () => {};
  }, []);

  return (
    <section>
      <h1>Settings</h1>
      <h2>Database</h2>
      <form>
        <button type="button" onClick={initializeDababase}>
          Initialize Database
        </button>
      </form>
      <hr />
      <h2>Masquerade</h2>
      <ul className="search-results">
        {masquerade === null ? (
          agents.map((agent: any) => (
            <li
              className="agent"
              key={agent.id}
              onClick={() => setMasquerade(agent)}
            >
              <p className="name">{agent.name}</p>
              <p>{truncate(agent.content, 80)}</p>
            </li>
          ))
        ) : (
          <li
            className="agent"
            key={masquerade.id}
            onClick={() => setMasquerade(null)}
          >
            Masquerading as: <p className="name">{masquerade.name}</p>
            <p>{truncate(masquerade.content, 80)}</p>
          </li>
        )}
      </ul>
    </section>
  );
};

export default Page;
