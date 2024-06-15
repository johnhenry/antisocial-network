"use client";
import type { Post } from "@/types/post_client";
import { useState, useEffect } from "react";
import obfo from "obfo";
import { createPost, getTopLevelPosts } from "@/lib/actions.post";
import { useRouter, usePathname } from "next/navigation";
import format from "@/util/time-ago.mjs";
import fileToBase64 from "@/util/to-base64";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [attachments, setAttachments] = useState<any[]>([]);
  const addAttachment = (file: any) =>
    setAttachments((attachments) => [...attachments, file]);
  const removeAttachment = (index: number) =>
    setAttachments(attachments.filter((_, i) => i !== index));
  const router = useRouter();
  const pathname = usePathname();

  const newPost = async () => {
    const form = document.getElementById("new-post");
    const data = obfo(form);
    const content = data.content.trim();
    if (!content && !attachments.length) {
      return;
    }
    const post = await createPost(content, {
      attachments,
      user_id: undefined,
      parent_id: undefined,
    });
    router.push(`post/${post.id}`);
  };
  const attach = async (event: InputEvent) => {
    const form = document.getElementById("new-post");
    const data = obfo(form);
    const attachments = data.attachments;
    if (!attachments || !attachments.length) {
      return;
    }
    for (const attachment of attachments) {
      const content = await fileToBase64(attachment);
      const { name, type } = attachment;
      addAttachment({ path: name, type, content });
    }
    (event.target as HTMLInputElement).value = "";
  };
  useEffect(() => {
    const getPosts = async () => {
      const posts = await getTopLevelPosts();
      // sort by timestamp
      const sorted = posts.toSorted((a: Post, b: Post) => {
        return Number(new Date(b.timestamp)) - Number(new Date(a.timestamp));
      });
      setPosts(sorted);
    };
    getPosts();
    return () => {
      // cleanup
    };
  }, []);

  return (
    <section>
      <form id="new-post" data-obfo-container="{}">
        <textarea name="content" placeholder="What's on your mind?"></textarea>
        <ul data-obfo-container="[]" data-obfo-name="files">
          {attachments.map((attachment, index) => (
            // file shoud have a button to remove it from list
            <li
              key={Math.random()}
              data-obfo-container="{}"
              className="attached-file"
              title={`${attachment.path}:\n${attachment.type}`}
            >
              <button type="button" onClick={() => removeAttachment(index)}>
                x
              </button>
              <input type="hidden" name="path" value={attachment.path} />
              <input type="hidden" name="type" value={attachment.type} />
              <input type="hidden" name="content." value={attachment.content} />
              <img
                alt={attachment.path}
                src={
                  attachment.type.startsWith("image/")
                    ? attachment.content
                    : "/static/attachment.png"
                }
              />
            </li>
          ))}
        </ul>
        <label>
          📎{" "}
          <input
            name="attachments"
            type="file"
            onChange={attach}
            data-obfo-cast="files"
          />
        </label>
        <button type="button" onClick={() => newPost()}>
          Post
        </button>
      </form>
      <ul className="posts">
        {posts.map((post: Post) => (
          <li key={post.id}>
            <header>
              <a href={`${pathname}post/${post.id}`}>
                {format(Number(new Date(post.timestamp)))}
              </a>
            </header>
            <main>{post.content}</main>
          </li>
        ))}
      </ul>
    </section>
  );
}
