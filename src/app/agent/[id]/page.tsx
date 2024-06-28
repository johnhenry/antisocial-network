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
          <form data-obfo-container="{}" data-obfo-name="parameters">
            <label>
              Model
              <select
                name="model"
                defaultValue={agent.parameters.model}
                onChange={taint}
              >
                {MODELS.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Temperature
              <input
                name="temperature"
                min="0"
                max="1"
                step="0.01"
                type="range"
                onChange={taint}
                defaultValue={agent.parameters.temperature}
                data-obfo-cast="number"
              />
            </label>
            <label>
              Format
              <select
                name="model"
                defaultValue={agent.parameters.format}
                onChange={taint}
              >
                <option value="">(none)</option>
                <option value={"json"}>json</option>
              </select>
            </label>
            <details>
              <summary>Parameters</summary>

              <label>
                Embedding Only
                <input
                  name="embeddingOnly"
                  type="checkbox"
                  onChange={taint}
                  data-obfo-cast="checkbox"
                  defaultChecked={agent.parameters.embeddingOnly}
                />
              </label>
              <label>
                f16KV
                <input
                  name="f16KV"
                  type="checkbox"
                  onChange={taint}
                  data-obfo-cast="checkbox"
                  defaultChecked={agent.parameters.f16KV}
                />
              </label>
              <label>
                Logits All
                <input
                  name="logitsAll"
                  type="checkbox"
                  onChange={taint}
                  data-obfo-cast="checkbox"
                  defaultChecked={agent.parameters.logitsAll}
                />
              </label>
              <label>
                Low Vram
                <input
                  name="lowVram"
                  type="checkbox"
                  onChange={taint}
                  data-obfo-cast="checkbox"
                  defaultChecked={agent.parameters.lowVram}
                />
              </label>
              <label>
                Penalize Newline
                <input
                  name="penalizeNewline"
                  type="checkbox"
                  onChange={taint}
                  data-obfo-cast="checkbox"
                  defaultChecked={agent.parameters.penalizeNewline}
                />
              </label>
              <label>
                Use MLock
                <input
                  name="useMLock"
                  type="checkbox"
                  onChange={taint}
                  data-obfo-cast="checkbox"
                  defaultChecked={agent.parameters.useMLock}
                />
              </label>
              <label>
                Use MMap
                <input
                  name="useMMap"
                  type="checkbox"
                  onChange={taint}
                  data-obfo-cast="checkbox"
                  defaultChecked={agent.parameters.useMMap}
                />
              </label>
              <label>
                Vocab Only
                <input
                  name="vocabOnly"
                  type="checkbox"
                  onChange={taint}
                  data-obfo-cast="checkbox"
                  defaultChecked={agent.parameters.vocabOnly}
                />
              </label>
              <label>
                Frequency Penalty
                <input
                  name="frequencyPenalty"
                  type="number"
                  onChange={taint}
                  defaultValue={agent.parameters.frequencyPenalty}
                  data-obfo-cast="number"
                />
              </label>
              <label>
                Keep alive
                <input
                  name="keepAlive"
                  type="number"
                  onChange={taint}
                  defaultValue={agent.parameters.keepAlive}
                  data-obfo-cast="number"
                />
              </label>

              <label>
                Main GPU
                <input
                  name="mainGpu"
                  type="number"
                  onChange={taint}
                  defaultValue={agent.parameters.mainGpu}
                  data-obfo-cast="number"
                />
              </label>
              <label>
                Mirostat
                <input
                  name="mirostat"
                  type="number"
                  onChange={taint}
                  defaultValue={agent.parameters.mirostat}
                  data-obfo-cast="number"
                />
              </label>
              <label>
                Mirostat Eta
                <input
                  name="mirostatEta"
                  type="number"
                  onChange={taint}
                  defaultValue={agent.parameters.mirostatEta}
                  data-obfo-cast="number"
                />
              </label>
              <label>
                Mirostat Tau
                <input
                  name="mirostatTau"
                  type="number"
                  onChange={taint}
                  defaultValue={agent.parameters.mirostatTau}
                  data-obfo-cast="number"
                />
              </label>
              <label>
                numBatch
                <input
                  name="numBatch"
                  type="number"
                  onChange={taint}
                  defaultValue={agent.parameters.numBatch}
                  data-obfo-cast="number"
                />
              </label>
              <label>
                numCtx
                <input
                  name="numCtx"
                  type="number"
                  onChange={taint}
                  defaultValue={agent.parameters.numCtx}
                  data-obfo-cast="number"
                />
              </label>
              <label>
                numGpu
                <input
                  name="numGpu"
                  type="number"
                  onChange={taint}
                  defaultValue={agent.parameters.numGpu}
                  data-obfo-cast="number"
                />
              </label>
              <label>
                numKeep
                <input
                  name="numKeep"
                  type="number"
                  onChange={taint}
                  defaultValue={agent.parameters.numKeep}
                  data-obfo-cast="number"
                />
              </label>
              <label>
                numPredict
                <input
                  name="numPredict"
                  type="number"
                  onChange={taint}
                  defaultValue={agent.parameters.numPredict}
                  data-obfo-cast="number"
                />
              </label>
              <label>
                numThread
                <input
                  name="numThread"
                  type="number"
                  onChange={taint}
                  defaultValue={agent.parameters.numThread}
                  data-obfo-cast="number"
                />
              </label>

              <label>
                presencePenalty
                <input
                  name="presencePenalty"
                  type="number"
                  onChange={taint}
                  defaultValue={agent.parameters.presencePenalty}
                  data-obfo-cast="number"
                />
              </label>
              <label>
                repeatLastN
                <input
                  name="repeatLastN"
                  type="number"
                  onChange={taint}
                  defaultValue={agent.parameters.repeatLastN}
                  data-obfo-cast="number"
                />
              </label>
              <label>
                repeatPenalty
                <input
                  name="repeatPenalty"
                  type="number"
                  onChange={taint}
                  defaultValue={agent.parameters.repeatPenalty}
                  data-obfo-cast="number"
                />
              </label>
              <label>
                ropeFrequencyBase
                <input
                  name="ropeFrequencyBase"
                  type="number"
                  onChange={taint}
                  defaultValue={agent.parameters.ropeFrequencyBase}
                  data-obfo-cast="number"
                />
              </label>
              <label>
                ropeFrequencyScale
                <input
                  name="ropeFrequencyScale"
                  type="number"
                  onChange={taint}
                  defaultValue={agent.parameters.ropeFrequencyScale}
                  data-obfo-cast="number"
                />
              </label>

              <label>
                tfsZ
                <input
                  name="tfsZ"
                  type="number"
                  onChange={taint}
                  defaultValue={agent.parameters.tfsZ}
                  data-obfo-cast="number"
                />
              </label>
              <label>
                topK
                <input
                  name="topK"
                  type="number"
                  onChange={taint}
                  defaultValue={agent.parameters.topK}
                  data-obfo-cast="number"
                />
              </label>
              <label>
                topP
                <input
                  name="topP"
                  type="number"
                  onChange={taint}
                  defaultValue={agent.parameters.topP}
                  data-obfo-cast="number"
                />
              </label>
              <label>
                typicalP
                <input
                  name="typicalP"
                  type="number"
                  onChange={taint}
                  defaultValue={agent.parameters.typicalP}
                  data-obfo-cast="number"
                />
              </label>
            </details>
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
