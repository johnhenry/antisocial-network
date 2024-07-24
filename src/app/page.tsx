"use client";

import type { FC, ComponentClass } from "react";
import type { PostExt, EntityExt, AgentPlusExt } from "@/types/mod";
import { useEffect, useState } from "react";
import useDebouncedEffect from "@/lib/hooks/use-debounce";
import { getPostsExternal } from "@/lib/database/mod";
import InfiniteScroller from "@/components/infinite-scroller";
import Entity from "@/components/entity";
import InputBox from "@/components/input-box";
import { useRouter } from "next/navigation";
type PageProps = {};
const SIZE = 10;
import { getEntitiesExternal } from "@/lib/database/mod";
import useLocalStorage from "@/lib/hooks/use-localstorage";
import { MASQUERADE_KEY } from "@/config/mod";
import Masquerade from "@/components/masquerade";

const SearchOptions = ({
  searchCount,
  setSearchCount,
  searchPosts,
  setSearchPosts,
  searchFiles,
  setSearchFiles,
  searchAgents,
  setSearchAgents,
  Wrapper = "div",
  searchMin,
  searchMax,
  ...props
}: {
  searchCount: number;
  setSearchCount: (value: number) => void;
  searchPosts: boolean;
  setSearchPosts: (value: boolean) => void;
  searchFiles: boolean;
  setSearchFiles: (value: boolean) => void;
  searchAgents: boolean;
  setSearchAgents: (value: boolean) => void;
  Wrapper?: ComponentClass<any> | string;
  searchMin: number;
  searchMax: number;
}) => {
  const body = (
    <>
      {searchPosts || searchFiles || searchAgents ? (
        <>
          <button
            onClick={() => setSearchPosts(!searchPosts)}
            className={searchPosts ? "active" : ""}
          >
            posts
          </button>
          <button
            onClick={() => setSearchFiles(!searchFiles)}
            className={searchFiles ? "active" : ""}
          >
            files
          </button>
          <button
            onClick={() => setSearchAgents(!searchAgents)}
            className={searchAgents ? "active" : ""}
          >
            agents
          </button>
          <input
            title="search count"
            type="range"
            min={searchMin}
            max={searchMax}
            value={searchCount}
            onChange={(event) => {
              setSearchCount(parseInt(event.target.value));
            }}
          ></input>
        </>
      ) : (
        <button onClick={() => setSearchPosts(true)}>Advanced Search</button>
      )}
    </>
  );
  return <Wrapper {...props}>{body}</Wrapper>;
};

const fetchChildren = (start = 0) => {
  let offset = start;
  return async () => {
    // TODO: restore after testing
    // return [];
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const newItmes = await getPostsExternal(offset, SIZE);
    offset += newItmes.length;
    return newItmes;
  };
};

const Page: FC<PageProps> = ({}) => {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [prependedItems, setPrepended] = useState<PostExt[]>([]);
  const [searchCount, setSearchCount] = useState(8);
  const [searchPosts, setSearchPosts] = useState(false);
  const [searchFiles, setSearchFiles] = useState(false);
  const [searchAgents, setSearchAgents] = useState(false);
  const [searchResults, setSearchResults] = useState<EntityExt[]>([]);
  const [masquerade, setMasquerade] = useLocalStorage<AgentPlusExt | null>(
    MASQUERADE_KEY,
    null // TODO: can this be undefined? I think there may be some wiere interactions with local storage.
  );
  const resetPrepended = () => setPrepended([]);
  useEffect(() => {
    const load = () => {
      setSearchText(searchText);
    };
    load();
    return () => {};
  }, []);

  const entityReady = (entity: EntityExt | void) => {
    if (!entity) {
      return;
    }
    const [type, id] = entity.id.split(":");

    switch (type) {
      case "error":
        alert(`Error: ${entity.content}`);
        break;
      case "post":
        const post = entity as PostExt;
        setPrepended([post]);
        break;
      case "file":
      case "agent":
        if (confirm(`navigate to new ${type}? (${id})`)) {
          router.push(`/${type}/${entity.id}`);
        }
        break;
    }
    // TOOO: add post to scroll list?
    // can i add some method that allows me to prepend items to the list
  };
  const search = async (
    searchText: string,
    searchCount: number,
    searchPosts: boolean,
    searchFiles: boolean,
    searchAgents: boolean
  ) => {
    if (!searchText.trim()) {
      setSearchResults([]);
      return;
    }
    const searchResults = await getEntitiesExternal(
      0,
      searchCount,
      searchText,
      {
        posts: searchPosts,
        files: searchFiles,
        agents: searchAgents || !(searchPosts || searchFiles),
      }
    );
    setSearchResults(searchResults);
  };

  useDebouncedEffect(
    () => {
      search(searchText, searchCount, searchPosts, searchFiles, searchAgents);
    },
    [searchText, searchCount, searchPosts, searchFiles, searchAgents],
    750
  );

  return (
    <article>
      <Masquerade
        masquerade={masquerade}
        setMasquerade={setMasquerade}
        className="agent-masquerade"
      />
      <InputBox
        Wrapper={"div"}
        className="input-box"
        extractText={setSearchText}
        sourceId={masquerade?.agent.id}
        entityReady={entityReady}
      />
      <SearchOptions
        searchCount={searchCount}
        setSearchCount={setSearchCount}
        searchMin={1}
        searchMax={100}
        searchPosts={searchPosts}
        setSearchPosts={setSearchPosts}
        searchFiles={searchFiles}
        setSearchFiles={setSearchFiles}
        searchAgents={searchAgents}
        setSearchAgents={setSearchAgents}
        className="search-options"
      />
      {searchResults.length ? (
        <ul>
          {searchResults.map((entity) => {
            return (
              <Entity
                key={entity.id}
                {...entity}
                masquerade={masquerade}
                setMasquerade={setMasquerade}
              />
            );
          })}
        </ul>
      ) : (
        <div className="infinite-scroller-window">
          <InfiniteScroller
            ChildRenderer={Entity}
            fetchChildren={fetchChildren(0)}
            prependedItems={prependedItems}
            resetPrepended={resetPrepended}
            childProps={{ masquerade, setMasquerade }}
            FinalItem={({ children, ...props }) => (
              <li {...props}>{children}</li>
            )}
          />
        </div>
      )}
    </article>
  );
};

export default Page;
