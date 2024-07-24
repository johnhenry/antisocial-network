"use client";
import type { AgentExt, AgentPlusExt, ErrorExt } from "@/types/mod";
import type { FC } from "react";
import { useEffect, useState, useRef } from "react";
import { getAgentPlusExternal, updateAgentExternal } from "@/lib/database/mod";
import obfo from "obfo";
import { MODELS, AI_SAYINGS, MASQUERADE_KEY } from "@/config/mod";
import imageFromString from "@/lib/util/image-from-string";
import QuoteCycler from "@/components/quote-cycler";
import useLocalStorage from "@/lib/hooks/use-localstorage";
export type Props = { params: { id: string } };
import Masquerade from "@/components/masquerade";
import { IconMask } from "@/components/icons";

const Page: FC<Props> = ({ params }) => {
  const [agentPlus, setAgentPlus] = useState<AgentPlusExt | undefined>(
    undefined
  );
  const [masquerade, setMasquerade] = useLocalStorage<AgentPlusExt | null>(
    MASQUERADE_KEY,
    null // TODO: can this be undefined? I think there may be some wiere interactions with local storage.
  );

  const identifier = decodeURIComponent(params.id || "");
  const [dirty, setDirty] = useState(false);
  const formRef = useRef(null);
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
    const data = obfo(formRef.current);
    data.qualities = data.qualities.filter(
      ([name, description]: [string, string]) =>
        name.trim() && description.trim()
    );

    const updatedAgent = await updateAgentExternal(identifier, data);
    if ((updatedAgent as ErrorExt).isError) {
      alert(`Error: ${(updatedAgent as ErrorExt).content}`);
      return;
    }
    const newAgentPlus = { ...agentPlus, agent: updatedAgent as AgentExt };
    setAgentPlus(newAgentPlus);
    setMasquerade(
      masquerade
        ? masquerade.agent.id === newAgentPlus.agent.id
          ? newAgentPlus
          : masquerade
        : null
    );
    alert(`Agent updated!`);
    setDirty(false);
  };
  useEffect(() => {
    const loadAgent = async () => {
      const agentPlus = await getAgentPlusExternal(identifier);
      console.log({ agentPlus });
      setAgentPlus(agentPlus);
      const { agent } = agentPlus;
      setQualities(agent.qualities.length ? agent.qualities : [["", ""]]);
    };
    loadAgent();
    return () => {
      // cleanup
    };
  }, []);
  if (!agentPlus) {
    return (
      <article>
        <QuoteCycler sayings={AI_SAYINGS} className="quote-cycler" random />
      </article>
    );
  }
  const toggleMasquerade = () => {
    return masquerade?.agent.id === agentPlus.agent.id
      ? setMasquerade(null)
      : setMasquerade(agentPlus);
  };
  const { agent } = agentPlus;
  return (
    <article data-obfo-container="{}" className="agent-single" ref={formRef}>
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
          <img
            src={
              agent.image
                ? `/file/${agent.image}/raw`
                : `data:image/png;base64, ${imageFromString(agent.hash)}`
            }
            alt={agent.id}
          />
          <form data-obfo-container="{}" data-obfo-name="parameters">
            <label>
              <button
                type="button"
                onClick={toggleMasquerade}
                title="save-changes"
                className={
                  masquerade?.agent.id === agent.id ? "masquerade" : ""
                }
              >
                <IconMask />{" "}
                {masquerade?.agent.id === agent.id
                  ? "Stop masquerading"
                  : "Masquerade"}{" "}
                as {agent.name}
              </button>
            </label>
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
              {/* <label>
                f16KV
                <input
                  name="f16KV"
                  type="checkbox"
                  onChange={taint}
                  data-obfo-cast="checkbox"
                  defaultChecked={agent.parameters.f16KV}
                />
              </label> */}
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
        <aside>
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
        </aside>
      </main>
    </article>
  );
};

export default Page;
