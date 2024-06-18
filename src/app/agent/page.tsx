"use client";
import { useState, useEffect } from "react";
import { getAllAgents, createAgent } from "@/lib/actions.agent";
import sortOnTimestamp from "@/util/sort-on-timestamp";
import { useRouter } from "next/navigation";

import AgentRenderer from "@/components/agent/index";
const Page = () => {
  const [agents, setAgents] = useState<any[]>([]);
  const router = useRouter();
  const newAgent = async () => {
    try {
      alert("Creating agent...");
      const agent = await createAgent();
      alert("Agent created!");
      router.push(`/agent/${agent.id}`);
    } catch (error) {
      console.error(error);
      alert(`Agent creation failed: ${error.message}`);
    }
  };
  useEffect(() => {
    const getAgents = async () => {
      const agents: any = await getAllAgents();
      setAgents(sortOnTimestamp(agents));
    };
    getAgents();
    return () => {
      // cleanup
    };
  }, []);
  return (
    <section>
      <h2>Agents</h2>
      <button type="button" onClick={() => newAgent()}>
        +
      </button>
      <ul className="posts">
        {agents.map((agent, index) => (
          <a className="agent" href={`/agent/${agent.id}`} key={index}>
            <AgentRenderer agent={agent} key={agent.id} />
          </a>
        ))}
      </ul>
    </section>
  );
};
export default Page;
