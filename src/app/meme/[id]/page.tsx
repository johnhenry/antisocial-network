"use client";
import type { FC } from "react";
import type { Meme, File, Agent } from "@/types/types";
import { useState, useEffect } from "react";
import {
  REL_CONTAINS,
  REL_INSERTED,
  REL_PRECEDES,
  REL_ELICITS,
  REL_REMEMBERS,
} from "@/settings";
import { getEntityWithReplationships, getAllAgents } from "@/lib/database/read";
import OmniForm from "@/components/omniform";
import { useRouter } from "next/navigation";
import truncate from "@/util/truncate-string";

import RelationshipToggler from "@/components/relationship-toggler";

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
  const router = useRouter();
  const [text, setText] = useState("");
  const [meme, setMeme] = useState<Meme | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  // relationships
  const [before, setBefore] = useState<Meme | null>(null);
  const [after, setAfter] = useState<Meme | null>(null);
  const [contains, setContains] = useState<File | null>(null);
  const [responds, setResponds] = useState<Meme[]>([]);
  const [elicits, setElicits] = useState<Meme[]>([]);
  const [inserted, setInserted] = useState<Meme[]>([]);
  const [remembers, setRemembers] = useState<string[]>([]);
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
            relationship: REL_ELICITS,
          },
          {
            table: "agent",
            relationship: REL_ELICITS,
          },
        ],
        out: [
          {
            table: "agent",
            relationship: REL_REMEMBERS,
          },
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

      const remembers = getRelationship(out, "agent", REL_REMEMBERS).map(
        (x) => x.id
      );

      setBefore(before);
      setAfter(after);
      setContains(contains);
      setElicits(elicits);
      setInserted(inserted);
      setResponds(responds);
      setRemembers(remembers);
      setMeme(meme);
      const agents = await getAllAgents();
      setAgents(agents);
      console.log({ agents, remembers });
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
        <pre>{meme.content}</pre>
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
      {elicits.length ? (
        <>
          <h2>Responses</h2>
          <ul className="search-results">
            {elicits.map((meme) => (
              <li key={meme.id}>
                <a
                  className="meme"
                  href={`/meme/${meme.id}`}
                  key={meme.id}
                  title={meme.timestamp}
                >
                  <pre>{meme.content}</pre>
                </a>
              </li>
            ))}
          </ul>
        </>
      ) : null}
      <h2>Remembers</h2>
      <ul className="search-results">
        {agents.map((agent: any) => (
          <RelationshipToggler
            inn={agent.id}
            relationship={REL_REMEMBERS}
            out={meme.id}
            collection={remembers}
            className="agent"
            Wrapper="li"
            key={agent.id}
          >
            <p className="name">{agent.name}</p>
            <p>{truncate(agent.content, 80)}</p>
          </RelationshipToggler>
        ))}
      </ul>
    </section>
  );
};
export default Page;
