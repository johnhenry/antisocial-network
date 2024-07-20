"use client";

import type { FC } from "react";
import type { PostExt } from "@/types/mod";
import { useEffect, useState } from "react";
import { postExtArray } from "@/fake-data";
import useDebouncedEffect from "@/lib/hooks/use-debounce";

import Post from "@/components/post";
import InputBox from "@/components/input-box";
type PageProps = {};
const Page: FC<PageProps> = ({}) => {
  const [posts, setPosts] = useState<PostExt[]>([]);
  const [searchText, setSearchText] = useState("");
  useEffect(() => {
    const load = () => {
      setSearchText("");
      setPosts(postExtArray);
    };
    load();
    return () => {};
  }, []);
  const postReady = (post: PostExt) => {
    if (confirm(`navigate to /post/${post.id} ?`)) {
    }
    setPosts([post, ...posts]);
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
        postReady={postReady}
      />
      <div className="post-list">
        {posts.map((post) => (
          <Post post={post} key={post.id} Wrapper={"div"} className="post" />
        ))}
      </div>

      <details>
        <summary>Previous Posts</summary>
        <ul className="post-list-small">
          {posts.map((post) => (
            <Post post={post} key={post.id} Wrapper={"li"} className="post" />
          ))}
        </ul>
      </details>
    </article>
  );
};

export default Page;
