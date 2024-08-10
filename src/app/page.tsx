"use client";

import type { FC, ComponentClass } from "react";
import type { PostExt, EntityExt, AgentPlusExt, LogExt } from "@/types/mod";
import { useEffect, useState } from "react";
import useDebouncedEffect from "@/lib/hooks/use-debounce";
import { getPostsExternal } from "@/lib/database/mod";
import InfiniteScroller from "@/components/infinite-scroller";
import Entity from "@/components/entity";
import InputBox from "@/components/input-box";
import { useRouter } from "next/navigation";
type PageProps = {};
const SIZE = 4;
import { getEntitiesExternal } from "@/lib/database/mod";
import useLocalStorage from "@/lib/hooks/use-localstorage";
import { MASQUERADE_KEY } from "@/config/mod";
import Masquerade from "@/components/masquerade";
import { IconFile, IconAgent, IconPost, IconSearch } from "@/components/icons";
import { getPostExternal } from "@/lib/database/mod";
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
  className?: string;
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
            <IconPost />
          </button>
          <button
            onClick={() => setSearchFiles(!searchFiles)}
            className={searchFiles ? "active" : ""}
          >
            <IconFile />
          </button>
          <button
            onClick={() => setSearchAgents(!searchAgents)}
            className={searchAgents ? "active" : ""}
          >
            <IconAgent />
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
        <button title="advanced search" onClick={() => setSearchPosts(true)}>
          <IconSearch />
        </button>
      )}
    </>
  );
  return <Wrapper {...props}>{body}</Wrapper>;
};

const getFetchChildren = (start = 0) => {
  let offset = start;
  return async () => {
    const newItmes = await getPostsExternal(offset, SIZE);
    offset += newItmes.length;
    return newItmes;
  };
};

import orderByTimeStampAndRemoveDuplicates from "@/lib/util/order-and-remove-duplicates";
const Page: FC<PageProps> = ({}) => {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [prependedItems, setPrepended] = useState<PostExt[]>([]);
  const [searchCount, setSearchCount] = useState(8);
  const [searchPosts, setSearchPosts] = useState(false);
  const [searchFiles, setSearchFiles] = useState(false);
  const [searchAgents, setSearchAgents] = useState(false);
  const [searchResults, setSearchResults] = useState<EntityExt[]>([]);
  const [fetchChildren, setFetchChildren] = useState(() => getFetchChildren(0));
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

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const reload = () => {
      setFetchChildren(() => getFetchChildren(0));
      timeout = setTimeout(reload, 10000);
    };
    reload();
    return () => {
      clearTimeout(timeout);
    };
  }, []);

  const entityReady = (entity: EntityExt | void) => {
    if (!entity) {
      return;
    }
    const [type, id] = entity.id.split(":");

    switch (type) {
      case "log":
        const {
          type: logType,
          metadata: { force, url },
        } = entity as LogExt & { metadata: { force: boolean; url: string } };
        switch (logType) {
          case "redirect": {
            if (!force && !confirm(`Navigate to ${url}?`)) {
              return;
            }
            if (url.startsWith("http://" || url.startsWith("https://"))) {
              return (window.location.href = url as string);
            }
            return router.push(url as string);
          }
        }
        return;
      case "error":
        alert(`Error: ${entity.content}`);
        break;
      case "post":
        const post = entity as PostExt;
        getPostExternal(post.id).then((post) => setPrepended([post]));
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
  const finiteScroll =
    searchText.trim() || searchPosts || searchFiles || searchAgents;

  const search = async (
    searchText: string,
    searchCount: number,
    searchPosts: boolean,
    searchFiles: boolean,
    searchAgents: boolean
  ) => {
    // if (!searchText.trim()) {
    //   setSearchResults([]);
    //   return;
    // }
    const searchResults = await getEntitiesExternal(
      0,
      searchCount,
      searchText,
      {
        posts: searchPosts || !(searchAgents || searchFiles),
        files: searchFiles,
        agents: searchAgents,
      }
    );
    setSearchResults(orderByTimeStampAndRemoveDuplicates(searchResults));
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
      {finiteScroll ? (
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
            fetchChildren={fetchChildren}
            prependedItems={prependedItems}
            resetPrepended={resetPrepended}
            childProps={{ masquerade, setMasquerade }}
            FinalItem={({ children, ...props }) => (
              <li {...props}>
                <span className="spinner" />
              </li>
            )}
          />
        </div>
      )}
    </article>
  );
};

export default Page;
