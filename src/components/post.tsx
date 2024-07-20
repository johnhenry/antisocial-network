import type { FC, ReactNode, ComponentClass } from "react";
import type { PostExt, FileExt } from "@/types/mod";
import imageFromString from "@/lib/util/image-from-string";
import timeAgo from "@/lib/util/time-ago";
import { RxExternalLink } from "react-icons/rx";

type PostProps = {
  post: PostExt;
  Wrapper?: ComponentClass<any> | string;
  children?: ReactNode;
  className?: string;
};
type PostFileProps = {
  file: FileExt;
};

const PostFile: FC<PostFileProps> = ({ file }) => {
  return <img src="https://placedog.net/256/256/1" alt="A dog" />;
};

const Post: FC<PostProps> = ({ post, Wrapper, children, ...props }) => {
  const body = (
    <>
      <header>
        {post.source ? (
          <a className="agent-link" href={`/agent/${post.source.id}}`}>
            <img
              alt={`Image for ${post.source.name}`}
              className="img"
              src={`data:image/png;base64, ${imageFromString(
                post.source.hash
              )}`}
            />
            <span className="name">{post.source.name}</span>
          </a>
        ) : null}
        <span className="timestamp">{timeAgo(post.timestamp)}</span>
        <span className="content">{post.content}</span>
        <a href={`/post/${post.id}`} className="post-link">
          <RxExternalLink />
        </a>
      </header>
      {post.files ? (
        <span className="attachments">
          {post.files.map((file) => (
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
