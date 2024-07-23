import type { FC, ReactNode, ComponentClass } from "react";
import type { FileExt, AgentExt } from "@/types/mod";
import imageFromString from "@/lib/util/image-from-string";
import timeAgo from "@/lib/util/time-ago";
import { IconAgent } from "@/components/icons";
import Image from "next/image";

type PostProps = AgentExt & {
  Wrapper?: ComponentClass<any> | string;
  children?: ReactNode;
  className?: string;
  masquerade?: AgentExt;
};
type PostFileProps = {
  file: FileExt;
};

const PostFile: FC<PostFileProps> = ({ file }) => {
  const body = file.type.startsWith("image/") ? (
    <img
      src={`/file/${file.id}/raw`}
      width="256"
      alt={file.content}
      title={file.content}
    ></img>
  ) : (
    <iframe
      src={`/file/${file.id}/raw`}
      width="256"
      title={file.content}
    ></iframe>
  );

  return <a href={`/file/${file.id}`}>{body}</a>;
};

const Post: FC<PostProps> = ({
  id,
  timestamp,
  content,
  Wrapper = "li",
  children,
  name,
  hash,
  ...props
}) => {
  const body = (
    <>
      <header>
        <span className="name">@{name}</span>
        <span className="timestamp">{timeAgo(timestamp)}</span>
        {content ? (
          <span
            className="content"
            dangerouslySetInnerHTML={{ __html: content }}
          ></span>
        ) : null}
        <a title={`open ${id}`} href={`/agent/${id}`} className="entity-link">
          <IconAgent />
        </a>
      </header>
      <span className="attachments">
        <Image
          alt={`Image for ${name}`}
          className="img"
          width="128"
          height="128"
          src={`data:image/png;base64, ${imageFromString(hash)}`}
        />
      </span>
      {children}
    </>
  );

  if (Wrapper) {
    return <Wrapper {...props}>{body}</Wrapper>;
  } else {
    return body;
  }
};
export default Post;
