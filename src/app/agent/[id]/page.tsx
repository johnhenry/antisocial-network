"use client";
import type { Agent } from "@/types/types";
import type { FC } from "react";
import { useState, useEffect } from "react";
import { getEntity } from "@/lib/database/read";
import obfo from "obfo";
import { DEFAULT_USER_IMAGE, MODELS, MODEL_BASIC } from "@/settings";
import { updateAgent } from "@/lib/database/update";
import { MASQUERADE_KEY } from "@/settings";
import useLocalStorage from "@/lib/hooks/use-localstorage";
import Masquerade from "@/components/masquerade";
export type Props = { params: { id: string } };

const Page: FC<Props> = ({ params }) => {
  const [masquerade, setMasquerade] = useLocalStorage<Agent | null>(
    MASQUERADE_KEY,
    null
  );
  const identifier = decodeURIComponent(params.id || "");
  const [agent, setAgent] = useState<Agent | null>(null);
  const [dirty, setDirty] = useState(false);
  const taint = () => setDirty(true);
  const [qualities, setQualities] = useState<[string, string][]>([["", ""]]);
  const addEmptyQuality = () => {
    taint();
    setQualities([...qualities, ["", ""]]);
  };
  const removeQuality = (index: number) => {
    return () => {
      taint();
      setQualities(qualities.filter((_, i) => i !== index));
    };
  };
  const update = async () => {
    const data = obfo(document.querySelector("section"));
    alert("Agent updating...");
    data.qualities = data.qualities.filter(
      ([name, description]: [string, string]) =>
        name.trim() && description.trim()
    );
    // return console.log({ data });
    const updatedAgent = await updateAgent(identifier, data);
    alert(`Agent updated! ${updatedAgent}`);
    // setAgent(updatedAgent);
    // setQualities(
    //   updatedAgent.qualities.length ? updatedAgent.qualities : [["", ""]]
    // );
    setDirty(false);
  };
  useEffect(() => {
    const loadAgent = async () => {
      const agent: any = await getEntity(identifier);
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
      <Masquerade
        masquerade={masquerade}
        setMasquerade={setMasquerade}
        className="agent-masquerade"
      />
      <h2>
        <input
          title="name"
          name="name"
          defaultValue={agent.name}
          onChange={taint}
        />{" "}
        {dirty ? (
          <button type="button" onClick={update} title="save-changes">
            ✓
          </button>
        ) : null}
      </h2>
      <main>
        <header>
          <img src={agent.image || DEFAULT_USER_IMAGE} alt={agent.id}></img>
          <form data-obfo-container="{}" data-obfo-name="model">
            <label>
              Temperature{" "}
              <input
                name="temperature"
                min="0"
                max="1"
                step="0.01"
                type="range"
                onChange={taint}
                defaultValue={agent.model?.temperature}
                data-obfo-cast="number"
              />
            </label>
            <label>
              Model{" "}
              <select
                name="model"
                defaultValue={agent.model?.model || MODEL_BASIC}
                onChange={taint}
              >
                {MODELS.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </label>
          </form>
        </header>
        <footer>
          <div>
            {agent.content}
            <details>
              <summary>Editable Description</summary>
              <textarea
                title="description"
                name="description"
                defaultValue={agent.description}
                onChange={taint}
              />
            </details>
          </div>
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
                    title="text"
                    type="text"
                    defaultValue={name}
                    onChange={taint}
                  />
                </label>
                <label>
                  <textarea
                    title="description"
                    defaultValue={description}
                    onChange={taint}
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
        </footer>
      </main>
    </section>
  );
};

export default Page;
