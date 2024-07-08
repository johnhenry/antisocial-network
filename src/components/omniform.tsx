"use client";
import type {
  ChangeEventHandler,
  FC,
  SetStateAction,
  Dispatch,
  ChangeEvent,
  KeyboardEventHandler,
} from "react";
import { useState, useRef } from "react";
import obfo from "obfo";
import { createFiles } from "@/lib/bridge/create";
import { createMeme } from "@/lib/bridge/create";
import { createAgent } from "@/lib/bridge/create";
import Image from "next/image";
import fileToBase64 from "@/util/to-base64";
import SplitButton from "@/components/split-button";

const { log } = console;

type Props = {
  setText: Dispatch<SetStateAction<string>>;
  resourceCreated?: Function;
  text: string;
  agent?: string;
  target?: string;
  placeholder?: string;
  allowNakedFiles?: boolean;
  postLabel?: string;
  postOnly?: boolean;
};

const COMBO_OPTIONS = [
  { title: "Command/Win + Enter", label: "Create meme" },
  { title: "Command/Win + Option + Enter", label: "Create meme, get response" },
];

const OmniForm: FC<Props> = ({
  setText,
  resourceCreated = () => {},
  text,
  agent,
  placeholder = "",
  allowNakedFiles = true,
  target,
  postLabel = "Post",
  postOnly = false,
}) => {
  const textRef = useRef<HTMLTextAreaElement>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    try {
      if (!text) {
        if (files.length && allowNakedFiles) {
          cleanInput();
          const [id, content] = await createFiles({ files });
          resourceCreated(id, content);
        }
        return;
      }
      cleanInput();
      const streaming = response && true;
      const [firstId, data] = await createMeme(
        { content: text, files },
        { response, agent, target, streaming }
      );
      if (streaming) {
        const dec = new TextDecoder("utf-8");
        for await (const item of data as ReadableStream<ArrayBuffer>) {
          // TODO: I might have to polyfill the Readable Stream @@asyncIterator https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream#browser_compatibility
          log(dec.decode(item));
        }
        resourceCreated(firstId);
      } else {
        resourceCreated(firstId, data);
      }
    } finally {
      setLoading(false);
    }
  };
  const cleanInput = () => {
    setTimeout(() => {
      if (textRef?.current) {
        textRef.current.value = "";
      }
      setText("");
      setFiles([]);
    });
  };
  const onEnter: KeyboardEventHandler = (event) => {
    if (event.key === "Enter") {
      if (event.metaKey) {
        makeFilesOrMemes();
      }
    }
  };

  const onSplitClick = async (event: SelectedEvent) => {
    let name;
    switch (event.target.value) {
      case "agent":
        name = prompt("Agent Name? (optional)");
        if (name === null) {
          return;
        }
        name = name.trim().split(" ").join("-").toLowerCase();
        const llmAgent = { description: text, files, name };
        console.log({ llmAgent });
        cleanInput();
        await createAgent(llmAgent);
        break;
      case "textfile":
        name = prompt("File Name? (optional)");
        if (name === null) {
          return;
        }
        const file = {
          type: "text/plain",
          name,
          content: Buffer.from(text).toString("base64"), //.replace(/^[^,]+,/, "")
        };
        cleanInput();
        await createFiles({ files: [...files, file] }, { agent });
        break;
    }
  };

  return (
    <>
      <form className={`omni-form`}>
        <main className="hover-solid">
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
        </main>
        <div className="form-create-buttons">
          {text || (files.length && allowNakedFiles) ? (
            <button type="button" onClick={() => makeFilesOrMemes()}>
              {text ? postLabel : "Upload"}
            </button>
          ) : null}
          {text && !postOnly ? (
            <div className="split-button">
              <SplitButton text="+" onClick={onSplitClick} defaultValue="">
                <option value="agent">Agent</option>
                <option value="textfile">Text File</option>
              </SplitButton>
            </div>
          ) : null}
        </div>
      </form>
    </>
  );
};
export default OmniForm;
