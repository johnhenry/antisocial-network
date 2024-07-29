"use client";

import type { FC } from "react";
import type {
  PostExt,
  PostPlusExt,
  AgentPlusExt,
  EntityExt,
  ErrorExt,
  LogExt,
} from "@/types/mod";
import { useEffect, useState } from "react";
import Post from "@/components/post";
import InputBox from "@/components/input-box";
import { getPostPlusExternal } from "@/lib/database/mod";
import { useRouter } from "next/navigation";
import useLocalStorage from "@/lib/hooks/use-localstorage";
import { MASQUERADE_KEY } from "@/config/mod";
import Masquerade from "@/components/masquerade";

import { IconFile, IconArrowLeft, IconArrowRight } from "@/components/icons";

type PageProps = {
  params: {
    id: string;
  };
};
const Page: FC<PageProps> = ({ params }) => {
  const identifier = decodeURIComponent(params.id || "");
  const [postPlus, setPostPlus] = useState<PostPlusExt>();
  const [elicits, setElicits] = useState<PostExt[]>([]);
  const router = useRouter();
  const [masquerade, setMasquerade] = useLocalStorage<AgentPlusExt | null>(
    MASQUERADE_KEY,
    null // TODO: can this be undefined? I think there may be some wiere interactions with local storage.
  );
  useEffect(() => {
    const load = async () => {
      const postPlus = await getPostPlusExternal(identifier);
      const { elicits, ...post } = postPlus;
      console.log({ postPlus });
      setPostPlus(post);
      setElicits(elicits || []);
    };
    load();
    return () => {};
  }, []);
  const entityReady = (entity: EntityExt | void) => {
    if (!entity) {
      return;
    }

    const [type, id] = entity.id.split(":");
    if (type === "error") {
      alert(`Error: ${(entity as ErrorExt).content}`);
    }

    if (type === "post") {
      if ((entity as PostExt).target?.id === identifier) {
        setElicits((elicits) => [entity as PostExt, ...elicits]);
        return;
      }
    }
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
      case "post":
      case "file":
      case "agent":
        if (confirm(`navigate to new ${type}? (${id})`)) {
          router.push(`/${type}/${entity.id}`);
        }
        break;
    }
  };
  if (!postPlus) {
    return <article>Loading</article>;
  }
  const { post, before, after, container } = postPlus;

  return (
    <article className="post-single">
      <Masquerade
        masquerade={masquerade}
        setMasquerade={setMasquerade}
        className="agent-masquerade"
      />
      {post.target ? (
        <ul className="list-tight">
          {[post.target].map((post) => (
            <Post
              key={post.id}
              Wrapper={"li"}
              className="target entity"
              masquerade={masquerade}
              setMasquerade={setMasquerade}
              {...post}
            />
          ))}
        </ul>
      ) : null}
      <Post
        Wrapper="div"
        className="post entity"
        masquerade={masquerade}
        setMasquerade={setMasquerade}
        {...post}
      />
      <nav>
        {before ? (
          <a
            href={`/post/${before.id}`}
            className="before"
            title={before.content}
          >
            <IconArrowLeft />
          </a>
        ) : null}
        {container ? (
          <a
            href={`/file/${container.id}`}
            className="container"
            title={container.content}
          >
            <IconFile />
          </a>
        ) : null}
        {after ? (
          <a href={`/post/${after.id}`} className="after" title={after.content}>
            <IconArrowRight />
          </a>
        ) : null}
      </nav>
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
            <Post
              key={post.id}
              Wrapper={"li"}
              className="elicits entity"
              {...post}
            />
          ))}
        </ul>
      ) : null}
    </article>
  );
};

export default Page;
