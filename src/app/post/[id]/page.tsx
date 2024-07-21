"use client";

import type { FC } from "react";
import type { PostExt } from "@/types/mod";
import { useEffect, useState } from "react";
import { postExtArray } from "@/fake-data";
import useDebouncedEffect from "@/lib/hooks/use-debounce";
import InfiniteScroller from "@/components/infinite-scroller";
import Post from "@/components/post";
import InputBox from "@/components/input-box";
import { getPostPlusExternal } from "@/lib/database/mod";
import { useRouter } from "next/navigation";

type PageProps = {
  params: {
    id: string;
  };
};
const Page: FC<PageProps> = ({ params }) => {
  const identifier = decodeURIComponent(params.id || "");
  const [post, setPost] = useState<PostExt>();
  const [elicits, setElicits] = useState<PostExt[]>([]);
  const router = useRouter();
  useEffect(() => {
    const load = async () => {
      const postPlus = await getPostPlusExternal(identifier);
      const { post, elicits } = postPlus;
      setPost(post);
      setElicits(elicits || []);
    };
    load();
    return () => {};
  }, []);
  const postReady = (post: PostExt) => {
    setElicits((elicits) => [post, ...elicits]);
  };

  return (
    <article>
      {post?.target ? (
        <details className="w-full">
          <summary>Previous Posts</summary>
          <ul className="list-tight">
            {[post.target].map((post) => (
              <Post key={post.id} Wrapper={"li"} className="post" {...post} />
            ))}
          </ul>
        </details>
      ) : null}
      {post ? <Post Wrapper="div" className="post" {...post} /> : null}
      <InputBox
        Wrapper={"div"}
        className="input-box"
        postReady={postReady}
        buttonText="Reply"
        targetId={post?.id}
      />
      {elicits && elicits.length ? (
        <ul className="list-tight">
          {elicits.map((post) => (
            <Post key={post.id} Wrapper={"li"} className="post" {...post} />
          ))}
        </ul>
      ) : null}
    </article>
  );
};

export default Page;
