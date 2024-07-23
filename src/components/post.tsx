import type { FC, ReactNode, ComponentClass } from "react";
import type { PostExt, FileExt, AgentExt } from "@/types/mod";
import imageFromString from "@/lib/util/image-from-string";
import timeAgo from "@/lib/util/time-ago";
import { IconPost } from "@/components/icons";
import Image from "next/image";

type PostProps = PostExt & {
  Wrapper?: ComponentClass<any> | string;
  children?: ReactNode;
  className?: string;
  masquerade?: AgentExt;
};

import { IconMemory } from "@/components/icons";

import Attachment from "@/components/attachment";

const Post: FC<PostProps> = ({
  id,
  source,
  timestamp,
  content,
  Wrapper = "li",
  files,
  children,
  masquerade,
  ...props
}) => {
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
          <button>
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
