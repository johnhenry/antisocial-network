"use client";
import type { Post } from "@/types/post_client";
import { useState, useEffect } from "react";
import obfo from "obfo";
import { createPost, getPost } from "@/lib/actions.post";

import { usePathname, useRouter } from "next/navigation";

const renderPostWithChildren = (post: Post, key: number) => {
  return (
    <li className="post-with-children">
      <header>
        <a href={`/post/${post.id}`}>{post.id}</a>
      </header>
      {post.content}
      {post.children.length ? (
        <ul>{post.children.map(renderPostWithChildren)}</ul>
      ) : null}
    </li>
  );
};

const Page = ({ params }) => {
  const identifier = decodeURIComponent(params.id || "");
  const [post, setPost] = useState();
  const pathname = usePathname();
  const router = useRouter();
  const appendPost = async () => {
    const form = document.getElementById("additional-post");
    const data = obfo(form);
    const content = data.content.trim();
    if (!content) {
      return;
    }
    const post = await createPost(content, { parent_id: identifier });
    console.log({ post });
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
  }, []);
  console.log({ post });
  return (
    <section>
      {post ? (
        <h1>
          Post: {post.id}
          {post.parent_id ? <a href={`/post/${post.parent_id}`}>↑</a> : null}
        </h1>
      ) : (
        <h1>Post (loading)</h1>
      )}
      {post ? <ul>{renderPostWithChildren(post)}</ul> : null}

      {post && post.attachments.length
        ? post.attachments.map((attachment, index) => (
            <a
              className="attachment-link"
              href={`/file/${attachment.id}`}
              key={index}
            >
              {attachment.type.startsWith("image/") ? (
                <img title={attachment.path} src={`/file/${attachment.id}`} />
              ) : (
                attachment.path
              )}
            </a>
          ))
        : null}

      <form id="additional-post" data-obfo-container="{}">
        <h2>Add</h2>
        <textarea name="content" placeholder="Additonal content"></textarea>
        <button type="button" onClick={() => appendPost()}>
          Append
        </button>
      </form>
    </section>
  );
};

export default Page;
