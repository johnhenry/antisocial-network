"use client";
import { useEffect, useState } from "react";
import { getEntity } from "@/lib/database/read";
import { updateFile } from "@/lib/database/update";

import obfo from "obfo";

const Page = ({ params }) => {
  const [file, setFile] = useState(null);
  const [dirty, setDirty] = useState(false);
  const taint = () => setDirty(true);
  const indetifier = decodeURIComponent(params.id || "");
  useEffect(() => {
    const fetchFile = async () => {
      const file = await getEntity(indetifier);
      setFile(file);
    };
    fetchFile();
  }, [indetifier]);
  const update = async () => {
    alert("updating...");
    const data = obfo(document.querySelector(".section-file"));
    // return console.log(data);
    await updateFile(indetifier, data);
    alert("updated!");
  };

  if (!file) {
    return <section>Loading...</section>;
  }
  return (
    <section className="section-file" data-obfo-container="{}">
      <h2>
        <input name="name" defaultValue={file.name} onChange={taint} />
      </h2>
      <main>
        <header>
          <p>
            Author{" "}
            <input name="author" defaultValue={file.author} onChange={taint} />
          </p>
          <p>
            Publisher
            <input
              name="publisher"
              defaultValue={file.publisher}
              onChange={taint}
            />
          </p>
          <p>
            Publish Date
            <input
              name="publishDate"
              type="date"
              defaultValue={file.publishDate}
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
          <p className="type">Type {file.type}</p>
          <iframe
            src={`/file/${file.id}/raw`}
            onload='javascript:(function(o){o.style.height=o.contentWindow.document.body.scrollHeight+"px";}(this));'
            width="256"
            height="256"
          ></iframe>
          <a href={`/file/${file.id}/raw`} download={file.name}>
            download
          </a>{" "}
          <a href={`/file/${file.id}/raw`} target="_blank">
            open
          </a>
        </footer>
      </main>
    </section>
  );
};

export default Page;
