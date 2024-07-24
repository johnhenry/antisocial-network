import type { FC, ReactNode, ComponentClass } from "react";
import type { PostExt, FileExt, AgentExt, AgentPlusExt } from "@/types/mod";
import imageFromString from "@/lib/util/image-from-string";
import timeAgo from "@/lib/util/time-ago";
import { IconPost, IconMask } from "@/components/icons";
import Image from "next/image";
import { useEffect, useState } from "react";
import { REL_REMEMBERS } from "@/config/mod";
type PostProps = PostExt & {
  Wrapper?: ComponentClass<any> | string;
  children?: ReactNode;
  className?: string;
  masquerade?: AgentPlusExt | null;
  setMasquerade?: (masquerade: AgentPlusExt | null) => void;
};

import { IconMemory } from "@/components/icons";

import Attachment from "@/components/attachment";
import { relateExt, unrelateExt } from "@/lib/database/mod";

const Post: FC<PostProps> = ({
  id,
  source,
  timestamp,
  content,
  Wrapper = "li",
  files,
  children,
  masquerade,
  setMasquerade,
  ...props
}) => {
  const [remembered, setRemembered] = useState<Set<string>>(new Set());
  useEffect(() => {
    const loadRemembrances = async () => {
      const memories =
        masquerade?.remembered?.map(({ id }) => {
          return id;
        }) || [];
      setRemembered(new Set(memories));
    };
    loadRemembrances();
    return () => {
      setRemembered(new Set());
    };
  }, [masquerade]);
  const toggleRemembered = async () => {
    const newRemembered = new Set(remembered);
    if (remembered.has(id)) {
      await unrelateExt(masquerade!.agent.id, REL_REMEMBERS, id);
      newRemembered.delete(id);
    } else {
      await relateExt(masquerade!.agent.id, REL_REMEMBERS, id);
      newRemembered.add(id);
    }
    setRemembered(() => {
      return newRemembered;
    });
    if (masquerade && setMasquerade) {
      setMasquerade({
        ...masquerade,
        remembered: [...newRemembered].map((id) => ({ id } as PostExt)),
      });
    }
  };
  const body = (
    <>
      <header>
        {source ? (
          <a className="agent-link" href={`/agent/${source.id}`}>
            <Image
              alt={`Image for ${source.name}`}
              className="img"
              width="128"
              height="128"
              src={`data:image/png;base64, ${imageFromString(source.hash)}`}
            />
            <span className="name">{source.name}</span>
          </a>
        ) : null}
        <span className="timestamp">{timeAgo(timestamp)}</span>
        {content ? (
          <span
            className="content"
            dangerouslySetInnerHTML={{ __html: content }}
          ></span>
        ) : null}
        <a title={`open ${id}`} href={`/post/${id}`} className="entity-link">
          <IconPost />
        </a>
      </header>
      {files ? (
        <span className="attachments">
          {files.map((file) => (
            <Attachment file={file} key={file.id} />
          ))}
        </span>
      ) : null}
      {children}
      {masquerade ? (
        <footer>
          <button
            title="toggle bookmarks"
            className={remembered.has(id) ? "bookmarked" : ""}
            onClick={() => toggleRemembered()}
          >
            <IconMask />
            <IconMemory />
          </button>
        </footer>
      ) : null}
    </>
  );

  if (Wrapper) {
    return <Wrapper {...props}>{body}</Wrapper>;
  } else {
    return body;
  }
};
export default Post;
