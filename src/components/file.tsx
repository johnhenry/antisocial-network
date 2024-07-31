import type { FC, ReactNode, ComponentClass } from "react";
import type { FileExt, AgentPlusExt } from "@/types/mod";

import timeAgo from "@/lib/util/time-ago";
import { IconFile, IconBookmark, IconMask } from "@/components/icons";
import { useEffect, useState } from "react";

import { relateExt, unrelateExt } from "@/lib/database/mod";

import { REL_BOOKMARKS } from "@/config/mod";

type PostProps = FileExt & {
  Wrapper?: ComponentClass<any> | string;
  children?: ReactNode;
  className?: string;
  masquerade?: AgentPlusExt;
  setMasquerade?: (masquerade: AgentPlusExt | null) => void;
};
import Attachment from "@/components/attachment";

const Post: FC<PostProps> = ({
  id,
  type,
  timestamp,
  content,
  Wrapper = "li",
  children,
  owner,
  count,
  hash,
  name,
  masquerade,
  setMasquerade,
  ...props
}) => {
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());
  useEffect(() => {
    const loadBookmarks = async () => {
      const bookmarks =
        masquerade?.bookmarked?.map(({ id }) => {
          return id;
        }) || [];
      setBookmarked(new Set(bookmarks));
    };
    loadBookmarks();
    return () => {
      setBookmarked(new Set());
    };
  }, [masquerade]);

  const toggleBookmarked = async () => {
    const newBookmarked = new Set(bookmarked);
    if (bookmarked.has(id)) {
      await unrelateExt(masquerade!.agent.id, REL_BOOKMARKS, id);
      newBookmarked.delete(id);
    } else {
      await relateExt(masquerade!.agent.id, REL_BOOKMARKS, id);
      newBookmarked.add(id);
    }
    setBookmarked(() => {
      return newBookmarked;
    });
    if (masquerade && setMasquerade) {
      setMasquerade({
        ...masquerade,
        bookmarked: [...newBookmarked].map((id) => ({ id } as FileExt)),
      });
    }
  };

  const body = (
    <>
      <header>
        <span className="name">
          {name} ({type})
        </span>
        <span className="timestamp">{timeAgo(timestamp)}</span>
        {content ? <span className="content">{content}</span> : null}
        <a title={`open ${id}`} href={`/file/${id}`} className="entity-link">
          <IconFile />
        </a>
      </header>
      <span className="attachments">
        <Attachment
          file={{ id, timestamp, content, type, owner, count, hash }}
        />
      </span>
      {children}
      {masquerade ? (
        <footer>
          <button
            title="toggle bookmarks"
            className={bookmarked.has(id) ? "bookmarked" : ""}
            onClick={() => toggleBookmarked()}
          >
            <IconMask />
            <IconBookmark />
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
