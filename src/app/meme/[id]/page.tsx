"use client";
import type { FC } from "react";
import type { Meme, File, Agent } from "@/types/types";
import { useState, useEffect } from "react";
import { REL_REMEMBERS } from "@/settings";
import {
  getEntityWithReplationships,
  getAllAgents,
  getFullMeme,
} from "@/lib/database/read";
import OmniForm from "@/components/omniform";
import { useRouter } from "next/navigation";
import { truncateHTML } from "@/util/truncate-string";
import { parseRelationship } from "@/util/parse-relationships";
import RelationshipToggler from "@/components/relationship-toggler";
import { MASQUERADE_KEY } from "@/settings";
import useLocalStorage from "@/lib/hooks/use-localstorage";
import Masquerade from "@/components/masquerade";
import QuoteCycler from "@/components/quote-cycler";
import { AI_SAYINGS } from "@/settings";
type Params = {
  params: {
    id: string;
  };
};

const Page: FC<Params> = ({ params }) => {
  const [masquerade, setmasquerade] = useLocalStorage<Agent | null>(
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
        <QuoteCycler
          sayings={AI_SAYINGS}
          interval={5000}
          className="quote-cycler"
          random
        />
      </section>
    );
  }

  return (
    <section className="section-meme">
      <Masquerade
        masquerade={masquerade}
        setmasquerade={setmasquerade}
        className="agent-masquerade"
      >
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
        <div className="meme responds" title={`hash: ${meme.hash}`}>
          <span className="quote start"></span>
          <a
            href={`/meme/${responds.id}`}
            dangerouslySetInnerHTML={{
              __html: truncateHTML(responds.content, 16),
            }}
            title={responds.content}
          ></a>
          <span className="quote end"></span>
        </div>
      ) : null}
      <main className="meme" title={`hash: ${meme.hash}`}>
        {before ? <a className="before" href={`/meme/${before.id}`}></a> : null}
        <span className="quote start"></span>
        <div dangerouslySetInnerHTML={{ __html: meme.content }}></div>
        <span className="quote end"></span>
        {after ? <a className="after" href={`/meme/${after.id}`}></a> : null}
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
          {new Date(meme.timestamp).toLocaleDateString()}
        </p>
      </aside>
      <OmniForm
        text={text}
        target={identifier}
        setText={setText}
        allowNakedFiles={false}
        allowCreateAgent={false}
        agent={masquerade?.id}
      />
      {elicits.length ? (
        <>
          <div className="elicited">
            {elicits.map((meme) => (
              <a
                title={`hash: ${meme.hash}`}
                key={meme.id}
                href={`/meme/${meme.id}`}
                className="meme tamed-html"
                title={
                  meme.content + (meme.source ? "\n--" + meme.source.name : "")
                }
              >
                <div
                  dangerouslySetInnerHTML={{
                    __html: truncateHTML(meme.content, 32),
                  }}
                ></div>
              </a>
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
};
export default Page;
