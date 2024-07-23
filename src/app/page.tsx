"use client";

import type { FC } from "react";
import type { PostExt, EntityExt } from "@/types/mod";
import { useEffect, useState } from "react";
import useDebouncedEffect from "@/lib/hooks/use-debounce";
import { getPostsExternal } from "@/lib/database/mod";
import InfiniteScroller from "@/components/infinite-scroller";
import Post from "@/components/post";
import InputBox from "@/components/input-box";
import { useRouter } from "next/navigation";
type PageProps = {};
const SIZE = 10;
const Page: FC<PageProps> = ({}) => {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [prependedItems, setPrepended] = useState<PostExt[]>([]);
  const resetPrepended = () => setPrepended([]);
  useEffect(() => {
    const load = () => {
      setSearchText("");
    };
    load();
    return () => {};
  }, []);

  const fetchChildren = (start = 0) => {
    let offset = start;
    return async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const newItmes = await getPostsExternal(offset, SIZE);
      offset += newItmes.length;
      return newItmes;
    };
  };

  const entityReady = (entity: EntityExt | void) => {
    if (!entity) {
      return;
    }
    const [type, id] = entity.id.split(":");

    switch (type) {
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
  const search = console.log;

  useDebouncedEffect(
    () => {
      search(searchText);
    },
    [searchText],
    750
  );

  return (
    <article>
      <InputBox
        Wrapper={"div"}
        className="input-box"
        extractText={setSearchText}
        entityReady={entityReady}
      />
      <div className="infinite-scroller-window">
        <InfiniteScroller
          ChildRenderer={Post}
          fetchChildren={fetchChildren(0)}
          prependedItems={prependedItems}
          resetPrepended={resetPrepended}
          childProps={{ className: "post" }}
          FinalItem={({ children, ...props }) => <li {...props}>{children}</li>}
        />
      </div>
    </article>
  );
};

export default Page;
