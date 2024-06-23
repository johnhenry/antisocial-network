"use client";
import type { FC } from "react";
import type { Doc } from "@/types/types";
import { useState, useEffect } from "react";
import { getDoc } from "@/lib/actions.doc";
import obfo from "obfo";
import { updateDoc } from "@/lib/actions.doc";

type Params = {
  params: {
    id: string;
  };
};

const Page: FC<Params> = ({ params }) => {
  const identifier = decodeURIComponent(params.id || "");
  const [doc, setDoc] = useState<Doc | null>(null);
  const [dirty, setDirty] = useState(false);
  const makeDirty = () => setDirty(true);
  const update = async () => {
    const updatedDoc = obfo(document.querySelector("form"));
    const doc = await updateDoc(identifier, updatedDoc);
    setDoc(doc);
  };
  useEffect(() => {
    const loadDoc = async () => {
      const doc = await getDoc(identifier);
      setDoc(doc);
    };
    loadDoc();
    return () => {
      // cleanup
    };
  }, [identifier]);

  if (!doc) {
    return (
      <section>
        <h2>Loading...</h2>
      </section>
    );
  }

  return (
    <section className="section-doc">
      <h2>Doc</h2>
      <form data-obfo-container="{}">
        <label>
          Title:{" "}
          <input
            name="title"
            defaultValue={doc.title || ""}
            onChange={makeDirty}
          />
        </label>
        <label>
          Author:{" "}
          <input
            name="author"
            defaultValue={doc.author || ""}
            onChange={makeDirty}
          />
        </label>
        <label>
          Publisher:{" "}
          <input
            name="publisher"
            defaultValue={doc.publisher || ""}
            onChange={makeDirty}
          />
        </label>
        <label>
          PublishDate:{" "}
          <input
            type="date"
            name="publishDate"
            defaultValue={doc.publishDate || ""}
            onChange={makeDirty}
          />
        </label>
        {dirty ? (
          <button type="button" onClick={update}>
            Update
          </button>
        ) : null}{" "}
        <details>
          <summary>Metadata</summary>
          <label>Type: {doc.type}</label>
          <label>ID: {doc.id}</label>
          <label>Hash: {doc.hash}</label>
          <pre>{JSON.stringify(doc.metadata, null, 2)}</pre>
        </details>
      </form>
      <h2>Agents</h2>
    </section>
  );
};
export default Page;
