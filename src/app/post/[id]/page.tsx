"use client";

import type { FC } from "react";
import type { PostExt, AgentPlusExt, EntityExt, ErrorExt } from "@/types/mod";
import { useEffect, useState } from "react";
import Post from "@/components/post";
import InputBox from "@/components/input-box";
import { getPostPlusExternal } from "@/lib/database/mod";
import { useRouter } from "next/navigation";
import useLocalStorage from "@/lib/hooks/use-localstorage";
import { MASQUERADE_KEY } from "@/config/mod";
import Masquerade from "@/components/masquerade";

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
  const [masquerade, setMasquerade] = useLocalStorage<AgentPlusExt | null>(
    MASQUERADE_KEY,
    null // TODO: can this be undefined? I think there may be some wiere interactions with local storage.
  );
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
  const entityReady = (entity: EntityExt | void) => {
    console.log({ entity });
    if (!entity) {
      return;
    }

    const [type, id] = entity.id.split(":");
    if (type === "error") {
      alert(`Error: ${(entity as ErrorExt).content}`);
    }

    if (type === "post") {
      if ((entity as PostExt).target?.id === identifier)
        setElicits((elicits) => [entity as PostExt, ...elicits]);
      return;
    }
    switch (type) {
      case "post":
      case "file":
      case "agent":
        if (confirm(`navigate to new ${type}? (${id})`)) {
          router.push(`/${type}/${entity.id}`);
        }
        break;
    }
  };

  return (
    <article>
      <Masquerade
        masquerade={masquerade}
        setMasquerade={setMasquerade}
        className="agent-masquerade"
      />
      {post?.target ? (
        <details className="w-full">
          <summary>Previous Posts</summary>
          <ul className="list-tight">
            {[post.target].map((post) => (
              <Post
                key={post.id}
                Wrapper={"li"}
                className="post"
                {...post}
                masquerade={masquerade}
              />
            ))}
          </ul>
        </details>
      ) : null}
      {post ? <Post Wrapper="div" className="post" {...post} /> : null}
      <InputBox
        Wrapper={"div"}
        className="input-box"
        entityReady={entityReady}
        buttonText="Reply"
        targetId={post?.id}
        sourceId={masquerade?.agent.id}
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
