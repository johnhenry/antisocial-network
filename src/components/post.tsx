import type { FC, ReactNode, ComponentClass } from "react";
import type { PostExt, FileExt } from "@/types/mod";
import imageFromString from "@/lib/util/image-from-string";
import timeAgo from "@/lib/util/time-ago";
import { RxExternalLink } from "react-icons/rx";

type PostProps = PostExt & {
  Wrapper?: ComponentClass<any> | string;
  children?: ReactNode;
  className?: string;
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
  source,
  timestamp,
  content,
  Wrapper = "li",
  files,
  children,
  ...props
}) => {
  const body = (
    <>
      <header>
        {source ? (
          <a className="agent-link" href={`/agent/${source.id}`}>
            <img
              alt={`Image for ${source.name}`}
              className="img"
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
        <a href={`/post/${id}`} className="post-link">
          <RxExternalLink />
        </a>
      </header>
      {files ? (
        <span className="attachments">
          {files.map((file) => (
            <PostFile file={file} key={file.id} />
          ))}
        </span>
      ) : null}
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
