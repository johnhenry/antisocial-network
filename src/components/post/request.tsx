"use client";
import type { ChangeEventHandler, FC } from "react";
import type { Post } from "@/types/post_client";
import { useEffect, useState } from "react";
import obfo from "obfo";
import { createPost, createPostAI } from "@/lib/actions.post";
import fileToBase64 from "@/util/to-base64";
import Image from "next/image";

import { getAllAgents } from "@/lib/actions.agent";

const AgentRenderer = ({
  agent,
  setAgent,
}: {
  agent: any;
  setAgent: Function;
}) => {
  return (
    <div className="agent" onClick={() => setAgent(agent)}>
      <Image
        src={agent.image ? agent.image : "/static/user.webp"}
        alt={agent.name}
        width={100}
        height={100}
      />
      <h2>{agent.name}</h2>
      <p>{agent.description}</p>
    </div>
  );
};

const Component: FC<{
  newPostCreated: Function;
  parent_id: string;
}> = ({ newPostCreated, parent_id }) => {
  const [agents, setAgents] = useState<any[]>([]);
  const [agent, setAgent] = useState<any>();

  const generateNewPost = async () => {
    if (!confirm("Generating new post...")) {
      return;
    }
    const post: Post = await createPostAI({
      user_id: agent.id,
      parent_id,
    });
    newPostCreated(post);
    alert("New post generated!");
  };
  useEffect(() => {
    const getAgents = async () => {
      const agents = await getAllAgents();
      console.log(agents);
      setAgents(agents);
    };
    getAgents();
    return () => {
      //cleanup;
    };
  }, []);

  return (
    <form id="new-post" className="create-request" data-obfo-container="{}">
      {agent ? (
        <header>
          <Image
            src={agent.image ? agent.image : "/static/user.webp"}
            alt={agent.name}
            width={64}
            height={64}
          />
          <span className="agent-name">{agent.name}</span>
          <button type="button" onClick={() => setAgent(null)}>
            x
          </button>
        </header>
      ) : null}
      <main>
        <input type="search" placeholder="Filter agents"></input>
        {agents.map((agent) => (
          <AgentRenderer agent={agent} setAgent={setAgent} />
        ))}
      </main>
      <footer>
        <button
          type="button"
          onClick={() => generateNewPost()}
          title="Create new post"
        >
          {agent ? "Use selected agent" : `I'm feeling lucky!`}
        </button>
      </footer>
    </form>
  );
};
export default Component;
