import type { Post } from "@/types/post_client";
import type { FC, ReactNode } from "react";
import { DEFAULT_USER_IMAGE } from "@/settings";
import format from "@/util/time-ago.mjs";
import Image from "next/image";
const Component: FC<{ post: Post; children?: ReactNode }> = ({
  post,
  children,
}) => {
  const agent = post.agent || {
    image: "/static/user.webp",
    name: "user",
    id: "",
  };
  const { attachments } = post;
  return (
    <>
      <header>
        <Image
          src={agent.image || DEFAULT_USER_IMAGE}
          alt="user"
          width={64}
          height={64}
        />
        <span className="agent-name">{agent.name}</span>
        <span>{format(Number(new Date(post.timestamp)))}</span>
      </header>
      {post.content ? <main>{post.content}</main> : null}
      <footer>
        {attachments.length
          ? attachments.map((attachment, index) => (
              // file shoud have a button to remove it from list
              <div
                key={Math.random()}
                data-obfo-container="{}"
                className="attached-file"
                title={`${attachment.path}:\n${attachment.type}`}
              >
                <Image
                  alt={attachment.path}
                  src={
                    attachment.type.startsWith("image/")
                      ? `/file/${attachment.id}`
                      : "/static/attachment.png"
                  }
                  width={64}
                  height={64}
                />
              </div>
            ))
          : null}
      </footer>
      {children}
    </>
  );
};
export default Component;
