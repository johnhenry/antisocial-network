"use client";
import type {
  ChangeEventHandler,
  FC,
  SetStateAction,
  Dispatch,
  ChangeEvent,
} from "react";
import { useState, useRef } from "react";
import obfo from "obfo";
import { createMeme, createFiles, createAgent } from "@/lib/database/create";
import Image from "next/image";
import fileToBase64 from "@/util/to-base64";
import SplitButton from "@/components/split-button";

type Props = {
  setText: Dispatch<SetStateAction<string>>;
  memeCreated: Function;
  filesCreated: Function;
  agentCreated: Function;
  text: string;
  agent?: string;
  target?: string;
  placeholder?: string;
  allowNakedFiles?: boolean;
  allowCreateAgent?: boolean;
};

const COMBO_OPTIONS = [
  { title: "Command/Win + Enter", label: "Create meme" },
  { title: "Command/Win + Option + Enter", label: "Create meme, get response" },
];

const OmniForm: FC<Props> = ({
  setText,
  memeCreated,
  filesCreated,
  agentCreated,
  text,
  agent,
  placeholder = "Start typing to create an agent, a meme, or search.",
  allowNakedFiles = true,
  allowCreateAgent = true,
  target,
}) => {
  const textRef = useRef<HTMLSelectElement>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [agentMode, setAgentMode] = useState(false);
  const toggleAgentMode: ChangeEventHandler = (event) => {
    setAgentMode(
      (event.target as HTMLInputElement).checked && allowCreateAgent
    );
  };
  const addFile = (file: any) => setFiles((files) => [...files, file]);
  const removeFile = (index: number) =>
    setFiles(files.filter((_, i) => i !== index));
  const attach: ChangeEventHandler = async (event) => {
    const form = document.querySelector("[title=files]");
    const data = obfo(form);
    const files = data.files;
    if (!files || !files.length) {
      return;
    }
    for (const file of files) {
      const content = await fileToBase64(file);
      const { name, type } = file;
      addFile({ name, type, content });
    }
    (event.target as HTMLInputElement).value = "";
  };
  const makeFilesOrMemes = async (response = false) => {
    if (!text) {
      if (files.length) {
        // if (!confirm("Create files?")) {
        //   return;
        // }
        cleanInput();
        const ids = await createFiles({ files });
        filesCreated(ids);
      }
      return;
    }
    cleanInput();
    const id = await createMeme(
      { content: text, files },
      { response, agent, target }
    );
    memeCreated(id);
  };
  const makeAgent = async () => {
    cleanInput();
    const id = await createAgent({ description: text, files });
    agentCreated(id);
  };
  const cleanInput = () => {
    setTimeout(() => {
      textRef.current.value = "";
      setText("");
      setFiles([]);
    });
  };
  const onEnter: ChangeEventHandler = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      if (event.metaKey) {
        if (agentMode) {
          makeAgent();
        } else {
          makeFilesOrMemes(event.altKey);
        }
      }
    }
  };

  const onSplit = (event) => {
    switch (event?.target.value) {
      case COMBO_OPTIONS[0].label:
        makeFilesOrMemes();
        break;
      case COMBO_OPTIONS[1].label:
        makeFilesOrMemes(true);
        break;
    }
  };

  return (
    <>
      <form className={`form-create${agentMode ? " agent-mode" : ""}`}>
        <textarea
          title="text"
          name="text"
          placeholder={placeholder}
          onChange={(event: ChangeEvent) =>
            setText((event.target as HTMLInputElement).value.trim())
          }
          onKeyDown={onEnter}
          ref={textRef}
        />
        <footer>
          <label title="files" data-obfo-container="{}">
            📎
            <input
              name="files"
              type="file"
              data-obfo-cast="files"
              multiple
              onChange={attach}
            />{" "}
          </label>
          {files.map((file, index) => (
            // file shoud have a button to remove it from list
            <div
              key={Math.random()}
              data-obfo-container="{}"
              className="attached-file"
              title={`${file.path}:\n${file.type}`}
            >
              <button type="button" onClick={() => removeFile(index)}>
                x
              </button>
              <input type="hidden" name="name" value={file.name} />
              <input type="hidden" name="type" value={file.type} />
              <input type="hidden" name="content" value={file.content} />
              <Image
                alt={file.name}
                src={
                  file.type.startsWith("image/")
                    ? file.content
                    : "/static/attachment.png"
                }
                width={32}
                height={32}
              />
            </div>
          ))}
        </footer>
      </form>
      <form className="form-create-buttons">
        {text ? (
          agentMode ? (
            <button type="button" onClick={makeAgent} title={"Create agent"}>
              Create Agent
            </button>
          ) : (
            <div className="split-button">
              <SplitButton onClick={onSplit} defaultValue={"Create meme"}>
                {COMBO_OPTIONS.map((option, index) => {
                  return (
                    <option title={option.title} key={index}>
                      {option.label + (files.length ? " with files" : "")}
                    </option>
                  );
                })}
              </SplitButton>
            </div>
          )
        ) : files.length && allowNakedFiles && !agentMode ? (
          <button type="button" onClick={() => makeFilesOrMemes()}>
            Upload Files
          </button>
        ) : null}
        {allowCreateAgent ? (
          <label>
            <input type="checkbox" onChange={toggleAgentMode} /> Agent Mode
          </label>
        ) : null}
      </form>
    </>
  );
};
export default OmniForm;
