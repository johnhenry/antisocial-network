"use client";
import type { Agent } from "@/types/types";
import { useState, useEffect, Suspense } from "react";
import useDebouncedEffect from "@/lib/hooks/use-debounce";
import { search } from "@/lib/database/search";
import OmniForm from "@/components/omniform";
import { MASQUERADE_KEY } from "@/settings";
import useLocalStorage from "@/lib/hooks/use-localstorage";
import Masquerade from "@/components/masquerade";
import { MiniFile, MiniAgent, MiniMeme } from "@/components/mini";

const Item = ({ item }: any) => {
  const [type] = item.id.split(":", 1);
  switch (type) {
    case "meme":
      return <MiniMeme meme={item} />;
    case "file":
      return <MiniFile file={item} />;
    case "agent":
      return <MiniAgent agent={item} />;
    default:
      return <></>;
  }
};

export default function Home() {
  const [masquerade, setmasquerade] = useLocalStorage<Agent | null>(
    MASQUERADE_KEY,
    null
  );
  // Search Results
  const [foundItems, setFoundItems] = useState<any[]>([]);
  const [text, setText] = useState<string | undefined>();
  const [searchSize, setSearchSize] = useState<number>(3);

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
        // console.log({ items });
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
      <OmniForm text={text} agent={masquerade?.id} setText={setText} />
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
