"use client";
import type { FC } from "react";
import type { Meme, File, Agent, Relationship } from "@/types/types";
import { useState, useEffect } from "react";
import {
  REL_CONTAINS,
  REL_INSERTED,
  REL_PRECEDES,
  REL_ELICITS,
  REL_REMEMBERS,
} from "@/settings";
import {
  getEntityWithReplationships,
  getAllAgents,
  getFullMeme,
} from "@/lib/database/read";
import OmniForm from "@/components/omniform";
import { useRouter } from "next/navigation";
import truncate, { truncateHTML } from "@/util/truncate-string";
import { parseRelationship } from "@/util/parse-relationships";
import RelationshipToggler from "@/components/relationship-toggler";
import { MASQUERADE_KEY } from "@/settings";
import useLocalStorage from "@/lib/hooks/use-localstorage";
import Masquerade from "@/components/masquerade";
type Params = {
  params: {
    id: string;
  };
};

const Page: FC<Params> = ({ params }) => {
  const [masquerade, setMasquerade] = useLocalStorage<Agent | null>(
    MASQUERADE_KEY,
    null
  );
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
      // const {
      //   default: meme,
      //   inn,
      //   out,
      // }: {
      //   default: any;
      //   inn: Relationship[];
      //   out: Relationship[];
      // } = await getEntityWithReplationships(identifier, {
      //   source: "meme",
      //   inn: [
      //     {
      //       table: "meme",
      //       relationship: REL_PRECEDES,
      //     },
      //     {
      //       table: "agent",
      //       relationship: REL_ELICITS,
      //     },
      //     {
      //       table: "meme",
      //       relationship: REL_ELICITS,
      //     },
      //   ],
      //   out: [
      //     {
      //       table: "agent",
      //       relationship: REL_REMEMBERS,
      //     },
      //     {
      //       table: "meme",
      //       relationship: REL_PRECEDES,
      //     },
      //     {
      //       table: "file",
      //       relationship: REL_CONTAINS,
      //     },
      //     {
      //       table: "agent",
      //       relationship: REL_INSERTED,
      //     },
      //     {
      //       table: "meme",
      //       relationship: REL_ELICITS,
      //     },
      //   ],
      // });
      const M = await getFullMeme(identifier);
      const {
        meme,
        before,
        file: contains,
        agent: inserted,
        responds,
        after,
        elicits,
        remembers,
      } = M;

      // const before = parseRelationship(out, "meme", REL_PRECEDES)[0] || null;
      // const after = parseRelationship(inn, "meme", REL_PRECEDES)[0] || null;
      // const contains = parseRelationship(out, "file", REL_CONTAINS)[0] || null;
      // const elicits = parseRelationship(inn, "meme", REL_ELICITS);
      // const inserted = parseRelationship(out, "agent", REL_INSERTED)[0] || null;
      // const responds = parseRelationship(out, "meme", REL_ELICITS)[0] || null;
      // const remembers = parseRelationship(out, "agent", REL_REMEMBERS).map(
      //   (x) => x.id
      // );
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

  const resourceCreated = (id: string, content: string = "") => {
    const [type] = id.split(":", 1);
    if (confirm(`open ${id}?` + "\n" + content)) {
      router.push(`/${type}/${id}`);
    }
  };
  return (
    <section className="section-meme">
      <Masquerade
        masquerade={masquerade}
        setMasquerade={setMasquerade}
        className="agent-masquerade"
      >
        {" "}
        <RelationshipToggler
          inn={masquerade}
          relationship={REL_REMEMBERS}
          out={meme.id}
          collection={remembers}
          Wrapper="span"
        >
          <span className="icon">🧠</span>
          <span className="check">✓</span>
        </RelationshipToggler>
      </Masquerade>
      {responds ? (
        <a
          href={`/meme/${responds.id}`}
          className="tamed-html"
          dangerouslySetInnerHTML={{
            __html: `⇪"${truncateHTML(responds.content, 64)}"`,
          }}
        ></a>
      ) : null}
      <main title={`hash: ${meme.hash}`}>
        <a href={before ? `/meme/${before.id}` : null}>
          <span>“</span>
        </a>
        <pre dangerouslySetInnerHTML={{ __html: meme.content }}></pre>
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
        resourceCreated={resourceCreated}
        text={text}
        target={identifier}
        setText={setText}
        allowNakedFiles={false}
        allowCreateAgent={false}
        agent={masquerade?.id}
      />
      {elicits.length ? (
        <>
          <ul className="search-results">
            {elicits.map((meme) => (
              <li key={meme.id}>
                <a
                  className="meme"
                  href={`/meme/${meme.id}`}
                  key={meme.id}
                  title={meme.timestamp}
                >
                  <pre
                    dangerouslySetInnerHTML={{ __html: meme.content }}
                    className="tamed-html"
                  ></pre>
                </a>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
};
export default Page;
