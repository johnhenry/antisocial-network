"use client";
import type { FC } from "react";
import { useState, useEffect } from "react";
import { getAgent, updateAgent } from "@/lib/actions.agent";
import sortOnTimestamp from "@/util/sort-on-timestamp";
import { useRouter } from "next/navigation";
import obfo from "obfo";

const Page = ({ params }): FC<{ params: { id: string } }> => {
  const identifier = decodeURIComponent(params.id || "");
  const [agent, setAgent] = useState<>(null);
  const [qualities, setQualities] = useState([["", ""]]);
  const addEmptyQuality = () => {
    setQualities([...qualities, ["", ""]]);
  };
  const removeQuality = (index) => {
    return () => {
      setQualities(qualities.filter((_, i) => i !== index));
    };
  };
  const processAgent = async () => {
    const data = obfo(document.querySelector("form"));
    alert("Agent updating...");
    data.qualities = data.qualities.filter(
      ([name, description]) => name.trim() && description.trim()
    );
    const updatedAgent = await updateAgent(identifier, data);
    alert("Agent updated!");
    setAgent(updatedAgent);
    setQualities(
      updatedAgent.qualities.length ? updatedAgent.qualities : [["", ""]]
    );
  };
  useEffect(() => {
    const loadAgent = async () => {
      const agent: any = await getAgent(identifier);
      console.log({ agent });
      setAgent(agent);
      setQualities(agent.qualities.length ? agent.qualities : [["", ""]]);
    };
    loadAgent();
    return () => {
      // cleanup
    };
  }, []);
  return (
    <section>
      {<h2>{agent ? `Agent:${identifier}` : `Loading...`}</h2>}
      {agent ? (
        <form data-obfo-container="{}">
          <label>
            @
            <input type="text" name="name" defaultValue={agent.name} />
            <details>
              <summary>System Prompt</summary>
              {agent.systemPrompt}
            </details>
          </label>

          <label>
            Description:
            <textarea name="description" defaultValue={agent.description} />
          </label>
          <fieldset data-obfo-container="[]" data-obfo-name="qualities">
            <legend>Qualities</legend>
            {qualities.map(([name, description], index) => (
              <div key={index} data-obfo-container="[]">
                <label>
                  Name:
                  <input type="text" defaultValue={name} />
                </label>
                <label>
                  Description:
                  <textarea defaultValue={description} />
                </label>
                <button type="button" onClick={removeQuality(index)}>
                  x
                </button>
              </div>
            ))}
            <button type="button" onClick={addEmptyQuality}>
              + Quality
            </button>
          </fieldset>
          <footer>
            <button type="button" onClick={processAgent}>
              Update
            </button>
          </footer>
        </form>
      ) : null}
    </section>
  );
};

export default Page;
