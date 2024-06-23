"use client";
import type { FC } from "react";
import type { Meme, File } from "@/types/types";
import { useState, useEffect } from "react";
import { getEntityWithReplationships } from "@/lib/database/read";
import OmniForm from "@/components/omniform";
import { useRouter } from "next/navigation";
import truncate from "@/util/truncate-string";

import {
  REL_CONTAINS,
  REL_INSERTED,
  REL_PRECEDES,
  REL_ELICITS,
} from "@/settings";

type Params = {
  params: {
    id: string;
  };
};

type Relationship = {
  table: string;
  relationship: string;
  results: any[];
};

const Page: FC<Params> = ({ params }) => {
  const identifier = decodeURIComponent(params.id || "");
  const [meme, setMeme] = useState<Meme | null>(null);
  const [before, setBefore] = useState<Meme | null>(null);
  const [after, setAfter] = useState<Meme | null>(null);
  const [contains, setContains] = useState<File | null>(null);
  const [responds, setResponds] = useState<Meme[]>([]);
  const [elicits, setElicits] = useState<Meme[]>([]);
  const [inserted, setInserted] = useState<Meme[]>([]);
  const [text, setText] = useState("");

  const router = useRouter();

  useEffect(() => {
    const loadMeme = async () => {
      const {
        default: meme,
        inn,
        out,
      }: {
        default: any;
        inn: Relationship[];
        out: Relationship[];
      } = await getEntityWithReplationships(identifier, {
        inn: [
          {
            table: "meme",
            relationship: REL_PRECEDES,
          },
          {
            table: "meme",
            relationship: REL_ELICITS,
          },
        ],
        out: [
          {
            table: "meme",
            relationship: REL_PRECEDES,
          },
          {
            table: "file",
            relationship: REL_CONTAINS,
          },
          {
            table: "agent",
            relationship: REL_INSERTED,
          },
          {
            table: "meme",
            relationship: REL_ELICITS,
          },
        ],
      });

      const getRelationship = (
        arr: Relationship[],
        table: string,
        relationship: string
      ) =>
        arr.find(
          (ship: Relationship) =>
            ship.table === table && ship.relationship === relationship
        )?.results || [];

      const before = getRelationship(out, "meme", REL_PRECEDES)[0] || null;
      const after = getRelationship(inn, "meme", REL_PRECEDES)[0] || null;
      const contains = getRelationship(out, "file", REL_CONTAINS)[0] || null;
      const elicits = getRelationship(inn, "meme", REL_ELICITS);
      const inserted = getRelationship(out, "agent", REL_INSERTED)[0] || null;
      const responds = getRelationship(out, "meme", REL_ELICITS)[0] || null;

      setBefore(before);
      setAfter(after);
      setContains(contains);
      setElicits(elicits);
      setInserted(inserted);
      setResponds(responds);
      setMeme(meme);
    };
    loadMeme();
    return () => {
      // cleanup
    };
  }, [identifier]);

  if (!meme) {
    return (
      <section>
        <h2>Loading...</h2>
      </section>
    );
  }
  const memeCreated = (id: string) => {
    alert("meme created: " + id);
    router.push(`/meme/${id}`);
  };
  const filesCreated = (ids: string[]) => {
    alert("files created: " + ids.join(", "));
    router.push(`/file/${ids[0]}`);
  };
  const agentCreated = (id: string) => {
    alert("agent created: " + id);
    router.push(`/agent/${id}`);
  };

  return (
    <section className="section-meme">
      {responds ? (
        <a href={`/meme/${responds.id}`}>
          ⇪ "{truncate(responds.content, 128)}"{" "}
        </a>
      ) : null}
      <main title={`hash: ${meme.hash}`}>
        <a href={before ? `/meme/${before.id}` : null}>
          <span>“</span>
        </a>
        <p>{meme.content}</p>
        <a href={after ? `/meme/${after.id}` : null}>
          <span>”</span>
        </a>
      </main>
      <aside>
        {contains ? (
          <a href={`/file/${contains.id}`} className="source">
            Found in: {contains.name}
          </a>
        ) : null}
        {inserted ? (
          <a href={`/agent/${inserted.id}`} className="source">
            Posted by @{inserted.name}
          </a>
        ) : null}
        <p className="date" title={meme.timestamp}>
          {new Date(Date.parse(meme.timestamp)).toLocaleDateString()}
        </p>
      </aside>
      <OmniForm
        memeCreated={memeCreated}
        filesCreated={filesCreated}
        agentCreated={agentCreated}
        text={text}
        target={identifier}
        setText={setText}
        allowNakedFiles={false}
        allowCreateAgent={false}
      />
      <ul className="memes">
        {elicits.map((meme) => (
          <li key={meme.id}>
            <a
              className="meme"
              href={`/meme/${meme.id}`}
              key={meme.id}
              title={meme.timestamp}
            >
              {meme.content}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
};
export default Page;
