"use client";

import type { FC } from "react";
import type { PostExt } from "@/types/mod";
import { useEffect, useState } from "react";
import { fakePosts } from "@/fake-data";

import Post from "@/components/post";
import InputBox from "@/components/input-box";
type PageProps = {};
const Page: FC<PageProps> = ({}) => {
  const [posts, setPosts] = useState<PostExt[]>([]);
  useEffect(() => {
    const load = () => {
      setPosts(fakePosts);
    };
    load();
    return () => {};
  }, []);
  const postReady = (post) => {
    if (confirm(`navigate to /post/${post.id} ?`)) {
    }
    console.log(post);
    setPosts([post, ...posts]);
  };

  return (
    <article>
      <InputBox
        Wrapper={"div"}
        className="input-box"
        extractText={console.log}
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
