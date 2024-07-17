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

import type { PostExt } from "@/types/mod";
type InputBoxProps = {
  Wrapper?: ComponentClass<any>;
  post: PostExt;
  postReady: (post: PostExt) => void;
  extractText?: (s: string) => void;
  extractTextDelay?: number;
  className?: string;
  sourceId?: string;
  targetId?: string;
  children?: ReactNode;
};

import { isSlashCommand } from "@/lib/util/command-format";
import useDebouncedEffect from "@/lib/hooks/use-debounce";
import fileToBase64 from "@/lib/util/to-base64";

import { createPostExternal } from "@/lib/create/mod";

const InputBox: FC<InputBoxProps> = ({
  Wrapper,
  post,
  postReady,
  extractText,
  extractTextDelay = 1000,
  sourceId,
  targetId,
  children,

  ...props
}) => {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<any[]>([]);
  const filePicker = useRef<HTMLInputElement>(null);
  const textArea = useRef<HTMLTextAreaElement>(null);
  const addFile = (file: any) => setFiles((files) => [...files, file]);
  const removeFile = (index: number) =>
    setFiles(files.filter((_, i) => i !== index));
  const attach: ChangeEventHandler = async (event) => {
    const files = obfo(filePicker.current);
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
  const execute = async () => {
    const post = await createPostExternal(text, { files });
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
        if (isSlashCommand(text)) {
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

  useDebouncedEffect(
    () => {
      const send = async () => {
        if (extractText) {
          extractText(text);
        }
      };
      send();
      return () => {
        // cleanup
      };
    },
    [text],
    extractTextDelay
  );

  const body = (
    <>
      <textarea
        className={isSlashCommand(text) ? "slash-command" : ""}
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
      <button onClick={execute}>Go</button>
    </>
  );

  if (Wrapper) {
    return <Wrapper {...props}>{body}</Wrapper>;
  } else {
    return body;
  }
};
export default InputBox;
