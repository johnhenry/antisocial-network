"use client";
import type { Agent } from "@/types/types";
import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import useDebouncedEffect from "@/lib/hooks/use-debounce";
import { search } from "@/lib/database/search";
import OmniForm from "@/components/omniform";
import truncate, { truncateHTML } from "@/util/truncate-string";
import { MASQUERADE_KEY } from "@/settings";
import useLocalStorage from "@/lib/hooks/use-localstorage";
import Masquerade from "@/components/masquerade";

const MiniFile = ({ file }: any) => <>{truncate(file.content, 128)}</>;
const MiniAgent = ({ agent }: any) => (
  <>
    @{agent.name}:{truncate(agent.content, 128)}
  </>
);
const MiniMeme = ({ meme }: any) => (
  <li key={meme.id}>
    <main>
      <span></span>
      <a
        className="meme tamed-html"
        href={`/meme/${meme.id}`}
        key={meme.id}
        title={meme.timestamp}
        dangerouslySetInnerHTML={{ __html: meme.content }}
      ></a>
      <span></span>
    </main>
    <footer></footer>
  </li>
);

const Item = ({ item }: any) => {
  const [type] = item.id.split(":", 1);
  if (type === "meme") {
    return <MiniMeme meme={item} />;
  } else if (item.type === "file") {
    return <MiniFile file={item} />;
  } else if (item.type === "agent") {
    return <MiniAgent agent={item} />;
  }
  return <></>;
};

export default function Home() {
  const [masquerade, setmasquerade] = useLocalStorage<Agent | null>(
    MASQUERADE_KEY,
    null
  );
  // Search Results
  const [foundItems, setFoundItems] = useState<any[]>([]);
  const [foundMemes, setFoundMemes] = useState<any[]>([]);
  const [foundFiles, setFoundFiles] = useState<any[]>([]);
  const [foundAgents, setFoundAgents] = useState<any[]>([]);
  const [text, setText] = useState<string | undefined>();
  const [searchSize, setSearchSize] = useState<number>(3);
  const router = useRouter();
  const resourceCreated = (id: string, content: string = "") => {
    const [type] = id.split(":", 1);
    if (confirm(`open ${id}?` + "\n" + content)) {
      router.push(`/${type}/${id}`);
    }
  };
  const searchSizeChange = (event: any) => {
    setSearchSize(Number(event.target.value));
  };
  useEffect(() => {
    setText("");
    return () => {
      // cleanup
    };
  }, []);

  useDebouncedEffect(
    () => {
      const load = async () => {
        const items: any[][] = await search(text || "", {
          size: searchSize,
        });
        console.log({ items });

        setFoundItems(items);
      };
      load();
      return () => {
        // cleanup
      };
    },
    [text, searchSize],
    750
  );

  return (
    <section>
      <Masquerade
        masquerade={masquerade}
        setmasquerade={setmasquerade}
        className="agent-masquerade"
      />
      <OmniForm
        resourceCreated={resourceCreated}
        text={text}
        agent={masquerade?.id}
        setText={setText}
      />
      <input
        type="range"
        min="3"
        max="100"
        onChange={searchSizeChange}
        value={searchSize}
      />
      <Suspense fallback={<>Loading...</>}>
        {foundItems.length ? (
          <ul className="search-results">
            {foundItems.map((item) => (
              <Item item={item} key={item.id} />
            ))}
          </ul>
        ) : null}
      </Suspense>
    </section>
  );
}
