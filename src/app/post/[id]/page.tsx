"use client";
import type { Post } from "@/types/post_client";
import type { FC, ReactNode } from "react";
import { useState, useEffect } from "react";
import obfo from "obfo";
import { createPost, getPost } from "@/lib/actions.post";
import { usePathname, useRouter } from "next/navigation";
import sortOnTimestamp from "@/util/sort-on-timestamp";
import ComponentPostCreate from "@/components/post/create";

import ComponentPost from "@/components/post/post";
import RequestResponse from "@/components/post/request";

import format from "@/util/time-ago.mjs";
import Image from "next/image";

const renderPostWithChildren = ({ post }: { post: Post }) => {
  return (
    <ComponentPost post={post}>
      <ul className="posts">
        {sortOnTimestamp(post.children, true).map((post, index) => (
          // Why is post.children sometimes empty?
          <li key={index}>
            <div className="post">{renderPostWithChildren({ post })}</div>
          </li>
        ))}
      </ul>
    </ComponentPost>
  );
};

const Page: FC<{ params: { id: string } }> = ({ params }) => {
  const identifier = decodeURIComponent(params.id || "");
  const [post, setPost] = useState<Post | null>(null);
  const [requestResponse, setRequestResponse] = useState<Boolean>(true);
  const toggleRequestResponse = () => setRequestResponse(!requestResponse);
  const router = useRouter();
  const newPostCreated = async (newPost: Post) => {
    if (post) {
      post.children.push(newPost);
      setPost({ ...post });
    }
  };
  useEffect(() => {
    const get = async () => {
      try {
        const post = await getPost(identifier, Infinity);
        setPost(post);
      } catch (error) {
        router.push("/");
        console.error(error);
      }
    };
    get();
    return () => {
      // cleanup
    };
  }, [router, identifier]);
  if (!post)
    return (
      <section>
        <h1>Post (loading)</h1>
      </section>
    );
  const agent = post.agent || {
    image: "/static/user.webp",
    name: "user",
    id: undefined,
  };
  const { attachments } = post;
  return (
    <section className="section-post">
      <header className="post-header">
        <Image src={agent.image} alt="user" width={64} height={64} />
        <span className="agent-name">{agent.name}</span>
        <span>{format(Number(new Date(post.timestamp)))}</span>
      </header>
      {post.content ? <main className="post-main">{post.content}</main> : null}
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
      <button type="button" onClick={toggleRequestResponse}>
        {requestResponse ? "Respond Directly" : "Request Response"}
      </button>
      {requestResponse ? (
        <RequestResponse
          newPostCreated={newPostCreated}
          parent_id={identifier}
        ></RequestResponse>
      ) : (
        <ComponentPostCreate
          newPostCreated={newPostCreated}
          parent_id={identifier}
          user_id={agent.id}
        ></ComponentPostCreate>
      )}

      {post.children.length ? (
        <ul className="posts">
          {post.children.map((post, index) => (
            <li key={index}>
              <a href={`/post/${post.id}`} className="post">
                {renderPostWithChildren({ post })}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
};

export default Page;
