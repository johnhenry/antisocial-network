"use client";
import type { ChangeEventHandler, FC } from "react";
import type { Post } from "@/types/post_client";
import { useState } from "react";
import obfo from "obfo";
import { createPost } from "@/lib/actions.post";
import fileToBase64 from "@/util/to-base64";
import Image from "next/image";

const Component: FC<{
  newPostCreated: Function;
  user_id?: string;
  parent_id?: string;
}> = ({ newPostCreated, user_id, parent_id }) => {
  const [attachments, setAttachments] = useState<any[]>([]);
  const addAttachment = (file: any) =>
    setAttachments((attachments) => [...attachments, file]);
  const removeAttachment = (index: number) =>
    setAttachments(attachments.filter((_, i) => i !== index));

  const [requestResponse, setRequestResponse] = useState(false);
  const toggleRequestResponse = () => setRequestResponse(!requestResponse);

  const generateNewPost = async () => {
    const form = document.getElementById("new-post");
    const data = obfo(form);
    const content = data.content.trim();
    if (!content && !attachments.length) {
      return;
    }
    const post: Post = await createPost(content, {
      attachments,
      user_id,
      parent_id,
    });
    newPostCreated(post);
  };
  const attach: ChangeEventHandler = async (event) => {
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

  return (
    <form id="new-post" className="create-post" data-obfo-container="{}">
      <main>
        <textarea name="content" placeholder="What's on your mind?"></textarea>
        {attachments.length ? (
          <footer data-obfo-container="[]" data-obfo-name="files">
            {attachments.map((attachment, index) => (
              // file shoud have a button to remove it from list
              <div
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
                <input
                  type="hidden"
                  name="content."
                  value={attachment.content}
                />
                <Image
                  alt={attachment.path}
                  src={
                    attachment.type.startsWith("image/")
                      ? attachment.content
                      : "/static/attachment.png"
                  }
                  width={64}
                  height={64}
                />
              </div>
            ))}
          </footer>
        ) : null}
      </main>
      <footer>
        <button
          type="button"
          title="request response"
          className={`request-response ${requestResponse ? "active" : ""}`}
          onClick={toggleRequestResponse}
        >
          ?
        </button>
        <label>
          📎
          <input
            title="attach files"
            name="attachments"
            type="file"
            onChange={attach}
            data-obfo-cast="files"
          />
        </label>
        <button
          type="button"
          onClick={() => generateNewPost()}
          title="Create new post"
        >
          ↑
        </button>
      </footer>
    </form>
  );
};
export default Component;
