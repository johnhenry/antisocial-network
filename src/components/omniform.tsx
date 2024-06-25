"use client";
import type {
  ChangeEventHandler,
  FC,
  SetStateAction,
  Dispatch,
  ChangeEvent,
} from "react";
import { useState } from "react";
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
        if (!confirm("Create files?")) {
          return;
        }
        cleanInput();
        const ids = await createFiles({ files });
        filesCreated(ids);
      }
      return;
    }
    // create meme
    if (!confirm("creating meme" + (response ? " with response..." : "..."))) {
      return;
    }
    // return console.log({ text, files, response });
    cleanInput();
    const id = await createMeme(
      { content: text, files },
      { response, agent, target }
    );
    memeCreated(id);
  };
  const makeAgent = async () => {
    if (!confirm("creating agent...")) {
      return;
    }
    // return console.log({ text, files });
    cleanInput();
    const id = await createAgent({ description: text, files });
    agentCreated(id);
  };
  const cleanInput = () => {
    setTimeout(() => {
      setText("");
      setFiles([]);
    });
  };
  const onEnter = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      if (event.metaKey) {
        makeFilesOrMemes(event.altKey);
      }
      if (event.ctrlKey) {
        makeAgent();
      }
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
            <button type="button" onClick={() => makeFilesOrMemes()}>
              Upload files
            </button>
          </form>
        ) : null
      ) : (
        <form className="form-create-buttons">
          <label className="button-with-secondary">
            <button
              type="button"
              onClick={() => makeFilesOrMemes()}
              className={files.length ? "with-files" : ""}
            >
              Create meme
            </button>
            <button
              type="button"
              className={"and-button" + (files.length ? " with-files" : "")}
              onClick={() => makeFilesOrMemes(true)}
            >
              Get response
            </button>
          </label>
          {allowCreateAgent ? (
            <button
              type="button"
              onClick={() => makeAgent()}
              className={files.length ? "with-files" : ""}
            >
              Create agent{files.length ? " with files" : ""}
            </button>
          ) : null}
        </form>
      )}
    </>
  );
};
export default OmniForm;
