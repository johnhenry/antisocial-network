"use client";

import type { FC } from "react";
import type { PostExt, PostPlusExt, AgentPlusExt } from "@/types/mod";
import { useEffect, useState } from "react";
import Post from "@/components/post";
import InputBox from "@/components/input-box";
import { getPostPlusExternal, getPostExternal } from "@/lib/database/mod";
import useLocalStorage from "@/lib/hooks/use-localstorage";
import { MASQUERADE_KEY } from "@/config/mod";
import Masquerade from "@/components/masquerade";
import { IconFile, IconArrowLeft, IconArrowRight } from "@/components/icons";
import DynamicLoader from "@/components/dynamic-loader";
import SSEater from "@/components/ss-eater";
import MessageHandler from "@/components/message-handler";
import ToastNotification from "@/components/toast-notification";
type PageProps = {
  params: {
    id: string;
  };
};
const Page: FC<PageProps> = ({ params }) => {
  const identifier = decodeURIComponent(params.id || "");
  const [postPlus, setPostPlus] = useState<PostPlusExt>();
  const [elicits, setElicits] = useState<PostExt[]>([]);
  const [masquerade, setMasquerade] = useLocalStorage<AgentPlusExt | null>(
    MASQUERADE_KEY,
    null // TODO: can this be undefined? I think there may be some wiere interactions with local storage.
  );
  useEffect(() => {
    const load = async () => {
      const postPlus = await getPostPlusExternal(identifier);
      const { elicits, ...post } = postPlus;
      setPostPlus(post);
      setElicits(elicits || []);
    };
    load();
    return () => {};
  }, []);
  if (!postPlus) {
    return <DynamicLoader />;
  }
  const { post, before, after, container } = postPlus;

  return (
    <>
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
            <a
              href={`/post/${after.id}`}
              className="after"
              title={after.content}
            >
              <IconArrowRight />
            </a>
          ) : null}
        </nav>
        <InputBox
          Wrapper={"div"}
          className="input-box"
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
      <SSEater src="/api/notifications">
        <MessageHandler
          map={(item) => {
            const [type] = item.id.split(":");
            let text;
            const id = item.id;
            const url = `/${type}/${item.id}`;
            switch (type) {
              case "error":
              case "file":
                return;
              case "agent":
                text = `@${item.name}: ${item.content}`;
                break;
              case "post":
                text = `${item.source?.name ? `@${item.source.name}: ` : ""}${
                  item.content
                }`;
                try {
                  if ((item as PostExt).target?.id === identifier) {
                    getPostExternal(item.id).then((post: PostExt) =>
                      setElicits((elicits) => [post, ...elicits])
                    );
                    return;
                  } else {
                    text = `${item.source?.name ? `[${item.source.name}]` : ""}
${item.content}`;
                    break;
                  }
                } catch (e) {
                  console.error(e);
                }
              default:
                return;
            }
            return { id, text, url, type };
          }}
        >
          <ToastNotification className="toast-notification" duration={5000} />
        </MessageHandler>
      </SSEater>
    </>
  );
};

export default Page;
