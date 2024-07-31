"use client";
import type { FC } from "react";
import type { FileExt, AgentExt } from "@/types/mod";
import { useEffect, useState, useRef } from "react";
import { getFilePlusExternal, updateFileExternal } from "@/lib/database/mod";

import obfo from "obfo";
import DynamicLoader from "@/components/dynamic-loader";

type Props = {
  params: {
    id: string;
  };
};
const Page: FC<Props> = ({ params }) => {
  const [file, setFile] = useState<FileExt | null>(null);
  const [dirty, setDirty] = useState(false);
  const formRef = useRef(null);
  const [bookmarkers, setBookmarkers] = useState<AgentExt[]>([]);

  const taint = () => setDirty(true);
  const indetifier = decodeURIComponent(params.id || "");
  useEffect(() => {
    const fetchFile = async () => {
      const { file, bookmarkers } = await getFilePlusExternal(indetifier);
      setFile(file);
      setBookmarkers(bookmarkers || []);
    };
    fetchFile();
  }, [indetifier]);
  const update = async () => {
    const data = obfo(formRef.current!);
    await updateFileExternal(indetifier, data);
    alert("File updated!");
  };

  if (!file) {
    return <DynamicLoader />;
  }
  return (
    <article ref={formRef} className="file-single" data-obfo-container="{}">
      <h2>
        <input
          title="name"
          name="name"
          defaultValue={file.name}
          onChange={taint}
        />
      </h2>
      <main>
        <header>
          <p>
            Author{" "}
            <input
              title="author"
              name="author"
              defaultValue={file.author}
              onChange={taint}
            />
          </p>
          <p>
            Publisher
            <input
              title="publisher"
              name="publisher"
              defaultValue={file.publisher}
              onChange={taint}
            />
          </p>
          <p>
            Publish Date
            <input
              title="date"
              name="date"
              type="date"
              defaultValue={file.date}
              onChange={taint}
            />
          </p>
          {dirty ? (
            <button type="button" onClick={() => update()}>
              Update
            </button>
          ) : null}
          <p>Summary: {file.content}</p>
          <details>
            <summary>Metadata</summary>
            <pre>{JSON.stringify(file.metadata, null, " ")}</pre>
          </details>
        </header>
        <footer>
          <p className="hash">{file.hash}</p>
          <p className="type">{file.type}</p>
          <a href={`/file/${file.id}/raw`} download={file.name}>
            download
          </a>{" "}
          <a href={`/file/${file.id}/raw`} target="_blank">
            open
          </a>
          {file.type.startsWith("image/") ? (
            <img alt={file.content} src={`/file/${file.id}/raw`} width="256" />
          ) : (
            <iframe
              title={`${file.name || file.id}`}
              name=" document"
              src={`/file/${file.id}/raw`}
              width="256"
            ></iframe>
          )}
        </footer>
      </main>
    </article>
  );
};

export default Page;
