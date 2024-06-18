"use client";
import type { FC } from "react";
import { useState, useEffect } from "react";
import { getAgent, updateAgent } from "@/lib/actions.agent";
import sortOnTimestamp from "@/util/sort-on-timestamp";
import { useRouter } from "next/navigation";
import obfo from "obfo";
import { DEFAULT_USER_IMAGE } from "@/settings";

const Page = ({ params }): FC<{ params: { id: string } }> => {
  const identifier = decodeURIComponent(params.id || "");
  const [agent, setAgent] = useState<>(null);
  const [qualities, setQualities] = useState([["", ""]]);
  const [edited, setEdited] = useState(false);
  const potentiallyEdited = () => setEdited(true);
  const addEmptyQuality = () => {
    potentiallyEdited();
    setQualities([...qualities, ["", ""]]);
  };
  const removeQuality = (index) => {
    return () => {
      potentiallyEdited();
      setQualities(qualities.filter((_, i) => i !== index));
    };
  };
  const processAgent = async () => {
    const data = obfo(document.querySelector("section"));
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
  if (!agent) {
    return (
      <section>
        <h1>Loading...</h1>
      </section>
    );
  }
  return (
    <section data-obfo-container="{}" className="section-agent">
      <header>
        <img src={agent.image || DEFAULT_USER_IMAGE}></img>
        <div
          className="agent-qualities "
          data-obfo-container="[]"
          data-obfo-name="qualities"
        >
          {qualities.length ? <div>Qualities</div> : null}

          {qualities.map(([name, description], index) => (
            <div key={index} data-obfo-container="[]" className="quality">
              <label>
                <input
                  type="text"
                  defaultValue={name}
                  onChange={potentiallyEdited}
                />
              </label>
              <label>
                <textarea
                  defaultValue={description}
                  onChange={potentiallyEdited}
                />
              </label>
              <button
                type="button"
                className="close"
                onClick={removeQuality(index)}
              >
                x
              </button>
            </div>
          ))}
          <button type="button" onClick={addEmptyQuality}>
            +
          </button>
        </div>
      </header>
      <main>
        <div>
          @
          <input
            type="text"
            name="name"
            defaultValue={agent.name}
            onChange={potentiallyEdited}
          />
          {edited ? (
            <button type="button" onClick={processAgent} title="save-changes">
              ✓
            </button>
          ) : null}
        </div>
        <div>
          {agent.systemPrompt}
          <details open>
            <summary>Editable Description</summary>
            <textarea name="description" defaultValue={agent.description} />
          </details>
        </div>
      </main>
    </section>
  );
};

export default Page;
