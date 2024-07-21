"use client";

import type {
  FC,
  ReactNode,
  ComponentClass,
  ChangeEventHandler,
  KeyboardEventHandler,
} from "react";
import { useRef, useState } from "react";
import { CgAttachment } from "react-icons/cg";
import Image from "next/image";
import obfo from "obfo";
import { mentionMatch } from "@/lib/util/match";
import { HiOutlineSparkles } from "react-icons/hi";
import type { PostExt } from "@/types/mod";
type InputBoxProps = {
  Wrapper?: ComponentClass<any> | string;
  postReady: (post: PostExt) => void;
  extractText?: (s: string) => void;
  className?: string;
  sourceId?: string;
  targetId?: string;
  children?: ReactNode;
  buttonText?: string;
};

import { isSlashCommand } from "@/lib/util/command-format";
import fileToBase64 from "@/lib/util/to-base64";

import { createPostExternal } from "@/lib/database/mod";

const InputBox: FC<InputBoxProps> = ({
  Wrapper,
  postReady,
  extractText,
  sourceId,
  targetId,
  children,
  buttonText = "Post",
  ...props
}) => {
  const [text, doText] = useState("");
  const isSlash = isSlashCommand(text);
  const hasMention = !isSlash && mentionMatch.test(text);
  const [files, setFiles] = useState<any[]>([]);
  const filePicker = useRef<HTMLInputElement>(null);
  const textArea = useRef<HTMLTextAreaElement>(null);
  const addFile = (file: any) => setFiles((files) => [...files, file]);
  const removeFile = (index: number) =>
    setFiles(files.filter((_, i) => i !== index));

  const ready = text.trim() || files.length;

  const setText = (text: string) => {
    doText(text);
    if (extractText) {
      extractText(text);
    }
  };

  const attach: ChangeEventHandler = async (event) => {
    // @ts-ignore
    // Type error: This expression is not callable.
    //  Type 'typeof import("obfo")' has no call signatures.
    const files = obfo(filePicker.current);
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
    setTimeout(() => {
      if (textArea.current) {
        textArea.current.value = "";
        // const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        //   window.HTMLInputElement.prototype,
        //   "value"
        // ).set;
        // nativeInputValueSetter.call(textArea.current, "");
        const event = new Event("input", { bubbles: true });
        textArea.current.dispatchEvent(event);
        setFiles([]);
      }
    });
    const post = await createPostExternal(text, { files, sourceId, targetId });
    if (post && postReady) {
      postReady(post);
    }
  };
  const keyDown: KeyboardEventHandler = (event) => {
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
        setText(textArea.current!.value);
        return;
      }
      case "f":
        event.preventDefault();
        filePicker.current!.click();
        break;
    }
  };

  const body = (
    <>
      <textarea
        className={isSlash ? "slash-command" : ""}
        placeholder="Type your message here"
        onChange={(event) => {
          setText(event.target.value);
        }}
        ref={textArea}
        onKeyDown={keyDown}
      ></textarea>
      <fieldset>
        <label className="label-file">
          <CgAttachment />
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
              <HiOutlineSparkles />
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
