"use client";
import type { ChangeEventHandler, FC } from "react";
import type { Post } from "@/types/post_client";
import { useEffect, useState } from "react";
import obfo from "obfo";
import { createPost, createPostAI } from "@/lib/actions.post";
import fileToBase64 from "@/util/to-base64";
import Image from "next/image";

import { getAllAgents } from "@/lib/actions.agent";

import AgentRenderer from "@/components/agent/index";

const Component: FC<{
  newPostCreated: Function;
  parent_id: string;
}> = ({ newPostCreated, parent_id }) => {
  const [agents, setAgents] = useState<any[]>([]);
  const [agent, setAgent] = useState<any>();
  const [filterString, setFilterString] = useState<any>();
  const updateFilter: ChangeEventHandler = (event) => {
    setFilterString(event.target.value.trim().toLowerCase());
  };
  const generateNewPost = async () => {
    if (!confirm("Generating new post...")) {
      return;
    }
    if (!agent) {
      alert(
        "Automatic selection not yet implemented! Please select an agent manually."
      );
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
      setAgents(agents);
      // setAgent(agents[0]);
    };
    getAgents();
    return () => {
      //cleanup;
    };
  }, []);

  return (
    <form id="new-post" className="create-request" data-obfo-container="{}">
      <main>
        {agent ? (
          <main>
            <header>
              <Image
                src={agent.image ? agent.image : "/static/user.webp"}
                alt={agent.name}
                width={64}
                height={64}
              />
              <button type="button" onClick={() => generateNewPost()}>
                Request Response from @{agent.name}
              </button>
            </header>
            <main>
              <p>{agent.systemPrompt}</p>
            </main>
            <button
              className="close"
              type="button"
              onClick={() => setAgent(null)}
            >
              x
            </button>
          </main>
        ) : (
          <main>
            <button
              type="button"
              onClick={() => generateNewPost()}
              title="Create new post"
            >
              {agent ? "Use selected agent" : `I'm feeling lucky!`}
            </button>
            <p>Automatically select agent based on message content.</p>
          </main>
        )}
      </main>
      <footer>
        <input
          type="search"
          placeholder="Filter agents"
          onChange={updateFilter}
        ></input>
        <div>
          {agents
            .filter((agent) => {
              if (!filterString) {
                return true;
              }
              return agent.indexed.toLowerCase().includes(filterString);
            })
            .map((agent, index) => (
              <div
                className="agent"
                onClick={() => setAgent(agent)}
                key={index}
              >
                <AgentRenderer agent={agent} />
              </div>
            ))}
        </div>
      </footer>
    </form>
  );
};
export default Component;
