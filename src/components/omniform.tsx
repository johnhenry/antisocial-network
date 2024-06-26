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
import ComboBox from "@/components/combobox";
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
  { title: "Option + Enter", label: "Create agent" },
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
    // create meme
    // if (!confirm("creating meme" + (response ? " with response..." : "..."))) {
    //   return;
    // }
    // return console.log({ text, files, response });
    cleanInput();
    const id = await createMeme(
      { content: text, files },
      { response, agent, target }
    );
    memeCreated(id);
  };
  const makeAgent = async () => {
    // if (!confirm("creating agent...")) {
    //   return;
    // }
    // return console.log({ text, files });
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
        makeFilesOrMemes(event.altKey);
      } else if (event.altKey) {
        makeAgent();
      }
    }
  };
  const onCombo = (event: SelectEvent) => {
    switch (event.selected) {
      case COMBO_OPTIONS[0].label:
        makeFilesOrMemes();
        break;
      case COMBO_OPTIONS[1].label:
        makeFilesOrMemes(true);
        break;
      case COMBO_OPTIONS[2].label:
        makeAgent();
        break;
    }
  };

  return (
    <>
      <form className="form-create">
        <textarea
          title="text"
          name="text"
          placeholder={placeholder}
          onChange={(event: ChangeEvent) =>
            setText((event.target as HTMLInputElement).value.trim())
          }
          onKeyDown={onEnter}
          ref={textRef}
        ></textarea>
        <footer>
          <label title="files" data-obfo-container="{}">
            📎{" "}
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
      {!text ? (
        allowNakedFiles && files.length ? (
          <form className="form-create-buttons">
            <button
              type="button"
              onClick={() => makeFilesOrMemes()}
              title={COMBO_OPTIONS[0].title}
            >
              Upload files
            </button>
          </form>
        ) : null
      ) : (
        <form className="form-create-buttons">
          <ComboBox
            defaultValue={COMBO_OPTIONS[0].label}
            className={"combobox"}
            onClick={onCombo}
            text="[‹‹‹]"
          >
            {COMBO_OPTIONS.map((option, index) => {
              if (index === 2 && !allowCreateAgent) {
                return null;
              }
              return (
                <option title={option.title} key={index}>
                  {option.label + (files.length ? " with files" : "")}
                </option>
              );
            })}
          </ComboBox>
        </form>
      )}
    </>
  );
};
export default OmniForm;
