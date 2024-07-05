"use client";
import type { FC } from "react";
import type { Agent, File, Relationship } from "@/types/types";
import { useEffect, useState } from "react";
import { getEntityWithReplationships, getAllAgents } from "@/lib/database/read";
import truncate from "@/util/truncate-string";
import { updateFile } from "@/lib/database/update";
import { parseRelationship } from "@/util/parse-relationships";
import obfo from "obfo";
import { REL_BOOKMARKS } from "@/settings";
import RelationshipToggler from "@/components/relationship-toggler";
import { MASQUERADE_KEY } from "@/settings";
import useLocalStorage from "@/lib/hooks/use-localstorage";
import Masquerade from "@/components/masquerade";
type Props = {
  params: {
    id: string;
  };
};
const Page: FC<Props> = ({ params }) => {
  const [masquerade, setmasquerade] = useLocalStorage<Agent | null>(
    MASQUERADE_KEY,
    null
  );
  const [file, setFile] = useState<File | null>(null);
  const [dirty, setDirty] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  const taint = () => setDirty(true);
  const indetifier = decodeURIComponent(params.id || "");
  useEffect(() => {
    const fetchFile = async () => {
      // const file = await getEntity(indetifier);
      const {
        default: file,
        out,
        inn,
      } = await getEntityWithReplationships(indetifier, {
        source: "file",
        out: [{ table: "agent", relationship: REL_BOOKMARKS }],
      });
      setFile(file);
      const bookmarks = parseRelationship(out, "agent", REL_BOOKMARKS).map(
        (x) => x.id
      );
      setBookmarks(bookmarks);

      const agents = await getAllAgents();
      setAgents(agents);
    };
    fetchFile();
  }, [indetifier]);
  const update = async () => {
    alert("updating...");
    const data = obfo(document.querySelector(".section-file"));
    await updateFile(indetifier, data);
    alert("updated!");
  };

  if (!file) {
    return <section>Loading...</section>;
  }
  return (
    <section className="section-file" data-obfo-container="{}">
      <Masquerade
        masquerade={masquerade}
        setmasquerade={setmasquerade}
        className="agent-masquerade"
      >
        <RelationshipToggler
          inn={masquerade}
          relationship={REL_BOOKMARKS}
          out={file.id}
          collection={bookmarks}
          Wrapper="span"
        >
          <span className="icon">📖</span>
          <span className="check">✓</span>
        </RelationshipToggler>
      </Masquerade>
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
          <p className="type">{file.type}</p>
          <a href={`/file/${file.id}/raw`} download={file.name}>
            download
          </a>{" "}
          <a href={`/file/${file.id}/raw`} target="_blank">
            open
          </a>
          {file.type.startsWith("image/") ? (
            <img src={`/file/${file.id}/raw`} width="256"></img>
          ) : (
            <iframe src={`/file/${file.id}/raw`} width="256"></iframe>
          )}
        </footer>
      </main>
    </section>
  );
};

export default Page;
