import type { FC, ReactNode, ComponentClass } from "react";
import type { PostExt, FileExt, AgentExt } from "@/types/mod";
import imageFromString from "@/lib/util/image-from-string";
import timeAgo from "@/lib/util/time-ago";
import { IconFile, IconBookmark } from "@/components/icons";
import Image from "next/image";

type PostProps = FileExt & {
  Wrapper?: ComponentClass<any> | string;
  children?: ReactNode;
  className?: string;
  masquerade?: AgentExt;
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
  ...props
}) => {
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
          <button>
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
