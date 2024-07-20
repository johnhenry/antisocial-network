"use client";

import type { FC } from "react";
import type { PostExt } from "@/types/mod";
import { useEffect, useState } from "react";
import { postExtArray } from "@/fake-data";
import useDebouncedEffect from "@/lib/hooks/use-debounce";
import InfiniteScroller from "@/components/infinite-scroller";

import Post from "@/components/post";
import InputBox from "@/components/input-box";
type PageProps = {};
const Page: FC<PageProps> = ({}) => {
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
      const newItems = postExtArray.slice(offset, offset + 10);
      offset += newItems.length;
      return newItems;
    };
  };

  const postReady = (post: PostExt) => {
    if (confirm(`navigate to /post/${post.id} ?`)) {
    }
    setPrepended([post]);
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
      <details>
        <summary>Previous Posts</summary>
        <ul className="list-tight">
          {postExtArray.map((post) => (
            <Post key={post.id} Wrapper={"li"} className="post" {...post} />
          ))}
        </ul>
      </details>
      <InputBox
        Wrapper={"div"}
        className="input-box"
        extractText={setSearchText}
        postReady={postReady}
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
