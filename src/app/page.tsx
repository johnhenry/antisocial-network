"use client";
import type { Agent } from "@/types/types";
import {
  useState,
  useEffect,
  useRef,
  Suspense,
  ChangeEventHandler,
} from "react";
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
  const searchFilterRef = useRef<HTMLDivElement>(null);
  const [filters, setFilters] = useState({
    meme: false,
    agent: false,
    file: false,
  });
  const changeFilter: ChangeEventHandler<HTMLInputElement> = (event) => {
    const { name, checked } = event.target;
    setFilters((filters) => ({ ...filters, [name]: checked }));
  };
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
        console.log({ filters });

        setFoundItems(items);
      };
      load();
      return () => {
        // cleanup
      };
    },
    [text, searchSize, filters],
    750
  );

  const items = !(filters.meme || filters.agent || filters.file)
    ? foundItems
    : foundItems.filter((item) => {
        const [type] = item.id.split(":", 1);
        if (type === "meme" && filters.meme) {
          return true;
        }
        if (type === "agent" && filters.agent) {
          return true;
        }
        if (type === "file" && filters.file) {
          return true;
        }
      });

  return (
    <section>
      <Masquerade
        masquerade={masquerade}
        setmasquerade={setmasquerade}
        className="agent-masquerade"
      />
      <OmniForm
        text={text}
        agent={masquerade?.id}
        setText={setText}
        placeholder="start typing to search or post a new meme"
      />
      <hr />

      <div className="search-filters" ref={searchFilterRef}>
        <label className="checklabel">
          Meme{" "}
          <input
            name="meme"
            type="checkbox"
            data-obfo-cast="checkbox"
            onChange={changeFilter}
          ></input>
        </label>
        <label className="checklabel">
          Agent{" "}
          <input
            name="agent"
            type="checkbox"
            data-obfo-cast="checkbox"
            onChange={changeFilter}
          ></input>
        </label>
        <label className="checklabel">
          File{" "}
          <input
            name="file"
            type="checkbox"
            data-obfo-cast="checkbox"
            onChange={changeFilter}
          ></input>
        </label>
      </div>
      <input
        type="range"
        min="3"
        max="100"
        onChange={searchSizeChange}
        value={searchSize}
      />
      <Suspense fallback={<>Loading...</>}>
        {items.length ? (
          <ul className="search-results">
            {items.map((item) => (
              <Item item={item} key={item.id} />
            ))}
          </ul>
        ) : null}
      </Suspense>
    </section>
  );
}
