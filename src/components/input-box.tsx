"use client";
import { FileProto } from "@/types/mod";
import type {
  FC,
  ReactNode,
  ComponentClass,
  ChangeEventHandler,
  KeyboardEventHandler,
  MutableRefObject,
  LegacyRef,
} from "react";
import { useRef, useState, useEffect } from "react";
import { IconFile, IconAI } from "@/components/icons";
import Image from "next/image";
import obfo from "obfo";
import { mentionMatch } from "@/lib/util/match";
import type { EntityExt } from "@/types/mod";
type InputBoxProps = {
  Wrapper?: ComponentClass<any> | string;
  entityReady: (post: EntityExt) => void;
  extractText?: (s: string) => void;
  className?: string;
  sourceId?: string;
  targetId?: string;
  children?: ReactNode;
  buttonText?: string;
  localStorageKey?: string;
};
import useLocalStorage from "@/lib/hooks/use-localstorage";

import { isSlashCommand } from "@/lib/util/command-format";
import fileToBase64 from "@/lib/util/to-base64";

import { createPostExternal } from "@/lib/database/mod";
import { useSearchParams } from "next/navigation";
import TextareaWithPopup from "@/components/text-pop";
import { Mutable } from "next/dist/client/components/router-reducer/router-reducer-types";
const InputBox: FC<InputBoxProps> = ({
  Wrapper,
  entityReady,
  extractText,
  sourceId,
  targetId,
  children,
  buttonText = "Post",
  localStorageKey = "input",
  ...props
}) => {
  const searchParams = useSearchParams();
  const [stashedText, setStashedText] = useState("");
  const [storedText, setStoredText] = useLocalStorage<string>(
    localStorageKey,
    "" // TODO: can this be undefined? I think there may be some wiere interactions with local storage.
  );
  const [text, setText] = useState(storedText);
  const isSlash = isSlashCommand(text);
  const hasMention = !isSlash && mentionMatch.test(text);
  const [files, setFiles] = useState<any[]>([]);
  const filePicker = useRef<HTMLInputElement>(null);
  const textArea = useRef<HTMLTextAreaElement>(null);
  const addFile = (file: any) => setFiles((files) => [...files, file]);
  const removeFile = (index: number) =>
    setFiles(files.filter((_, i) => i !== index));

  const ready = text.trim() || files.length;

  const doText = (text: string) => {
    setText(text);
    setStoredText(text);
    // if (textArea!.current.value !== text) {
    //   textArea!.current.value = text;
    // }
    if (extractText) {
      extractText(text);
    }
  };

  const attach: ChangeEventHandler = async (event) => {
    const files = obfo<FileProto[]>(filePicker.current!);
    if (!files || !files.length) {
      return;
    }
    for (const file of files) {
      const content = await fileToBase64(file);
      const { name, type } = file;
      addFile({ name, type, content, sourceId, targetId });
    }
    (event.target as HTMLInputElement).value = "";
  };
  const execute = async () => {
    if (!(text.trim() || files.length)) {
      return;
    }
    setTimeout(() => {
      if (textArea.current) {
        setStashedText(text);
        textArea.current.value = "";
        // const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        //   window.HTMLInputElement.prototype,
        //   "value"
        // ).set;
        // nativeInputValueSetter.call(textArea.current, "");
        const event = new Event("input", { bubbles: true });
        textArea.current.dispatchEvent(event);
        doText("");
        setFiles([]);
      }
    });

    const entity = await createPostExternal(text, {
      files,
      sourceId,
      targetId,
    });

    if (entity && entityReady) {
      entityReady(entity);
    }
  };
  const keyDown: KeyboardEventHandler = (event) => {
    if (event.key === "ArrowUp" && !text.trim() && stashedText) {
      textArea.current!.value = stashedText;
      doText(stashedText);
      setStashedText("");
      return;
    }
    if (!event.metaKey) {
      return;
    }
    switch (event.key) {
      case "Enter":
        event.preventDefault();
        return execute();
      case "/": {
        event.preventDefault();
        if (isSlash) {
          const indexOfSlash = text.indexOf("/");
          textArea.current!.value = text.slice(indexOfSlash + 1);
        } else {
          textArea.current!.value = "/" + text;
        }
        doText(textArea.current!.value);
        return;
      }
      case "f":
        event.preventDefault();
        filePicker.current!.click();
        break;
    }
  };
  useEffect(() => {
    const text = decodeURIComponent(searchParams.get("q") || "") || storedText!;
    if (text) {
      doText(text);
    }
  }, [searchParams, storedText]);

  const body = (
    <>
      <TextareaWithPopup
        className={isSlash ? "slash-command" : ""}
        placeholder="What's on your mind?"
        onChange={(event) => {
          doText(event.target.value);
        }}
        ref={
          textArea as MutableRefObject<
            LegacyRef<HTMLTextAreaElement> | undefined
          >
        }
        onKeyDown={keyDown}
        // defaultValue={
        //   decodeURIComponent(searchParams.get("q") || "") || storedText
        // }
        value={text}
        setValue={doText}
      />
      <fieldset>
        <label className="label-file">
          <IconFile />
          <input
            title="hidden file picker"
            ref={filePicker}
            type="file"
            data-obfo-cast="files"
            multiple
            onChange={attach}
          />
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
      </fieldset>
      {ready ? (
        <button onClick={execute}>
          {isSlash ? "/" : buttonText}
          {hasMention ? (
            <>
              {" "}
              <IconAI className="icon-ai" />
            </>
          ) : null}
        </button>
      ) : null}
    </>
  );

  if (Wrapper) {
    return <Wrapper {...props}>{body}</Wrapper>;
  } else {
    return body;
  }
};
export default InputBox;
