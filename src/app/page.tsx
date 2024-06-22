"use client";
import type { Post } from "@/types/post_client";
import type { ChangeEventHandler, FC } from "react";

import { useState, useEffect } from "react";
import { getTopLevelPosts } from "@/lib/actions.post";
import { useRouter } from "next/navigation";
import sortOnTimestamp from "@/util/sort-on-timestamp";
import ComponentPost from "@/components/post/post";
import ComponentPostCreate from "@/components/post/create";
import obfo from "obfo";

import { createMeme, createFiles, createAgent } from "@/lib/database/create";

import Image from "next/image";

import fileToBase64 from "@/util/to-base64";

export default function Home() {
  // const [posts, setPosts] = useState<any[]>([]);
  // const router = useRouter();
  // const newPostCreated = async (post) => {
  //   router.push(`post/${post.id}`);
  // };
  // useEffect(() => {
  //   const getPosts = async () => {
  //     const posts: any[] = await getTopLevelPosts();
  //     // sort by timestamp
  //     setPosts(sortOnTimestamp(posts));
  //   };
  //   getPosts();
  //   return () => {
  //     // cleanup
  //   };
  // }, []);

  // Creation
  const [files, setFiles] = useState<any[]>([]);
  const addFile = (file: any) => setFiles((files) => [...files, file]);
  const removeFile = (index: number) =>
    setFiles(files.filter((_, i) => i !== index));
  const [text, setText] = useState("");
  // Search Results
  const [foundMemes, setFoundMemes] = useState([]);
  const [foundDocs, setFoundDocs] = useState([]);
  const [foundAgents, setFoundAgents] = useState([]);
  const makeFilesOrMemes = async (response = false) => {
    if (!text) {
      if (files.length) {
        alert("creating files ...");
        // return console.log({ files });
        const ids = await createFiles({ files });
        alert("File created: " + ids.join(", "));
        // create files;
      }
      return;
    }
    // create meme
    alert("creating meme" + (response ? " with response..." : "..."));
    // return console.log({ text, files, response });
    const id = await createMeme({ content: text, files }, { response });
    alert("meme created: " + id);
  };
  const search: ChangeEventHandler = async (event) => {
    const text = (event.target as HTMLInputElement).value.trim();
    setText(text);
  };
  const makeAgent = async () => {
    alert("creating agent...");
    // return console.log({ text, files });
    const id = await createAgent({ description: text, files });
    alert("agent created: " + id);
  };
  const attach: ChangeEventHandler = async (event) => {
    const form = document.querySelector("[title=files]");
    const data = obfo(form);
    const files = data.files;
    if (!files || !files.length) {
      return;
    }
    for (const file of files) {
      const content = await fileToBase64(file);
      const { name, type } = file;
      addFile({ name, type, content });
    }
    (event.target as HTMLInputElement).value = "";
  };
  return (
    <section>
      {/* <ComponentPostCreate newPostCreated={newPostCreated} /> */}
      <form className="form-create">
        <textarea
          title="text"
          name="text"
          placeholder="Create meme, create agent, or just upload docs"
          onChange={search}
        ></textarea>
        <footer>
          <label title="files" data-obfo-container="{}">
            File{" "}
            <input
              name="files"
              type="file"
              data-obfo-cast="files"
              onChange={attach}
            />{" "}
          </label>
          {files.map((file, index) => (
            // file shoud have a button to remove it from list
            <div
              key={Math.random()}
              data-obfo-container="{}"
              className="attached-file"
              title={`${file.path}:\n${file.type}`}
            >
              <button type="button" onClick={() => removeFile(index)}>
                x
              </button>
              <input type="hidden" name="name" value={file.name} />
              <input type="hidden" name="type" value={file.type} />
              <input type="hidden" name="content" value={file.content} />
              <Image
                alt={file.name}
                src={
                  file.type.startsWith("image/")
                    ? file.content
                    : "/static/attachment.png"
                }
                width={32}
                height={32}
              />
            </div>
          ))}
        </footer>
      </form>
      {!text ? (
        <form className="form-create-buttons">
          <button type="button" onClick={() => makeFilesOrMemes()}>
            Just upload docs
          </button>
        </form>
      ) : (
        <form className="form-create-buttons">
          <label className="button-with-secondary">
            <button type="button" onClick={() => makeFilesOrMemes()}>
              Create meme
            </button>
            <button
              type="button"
              className="and-button"
              onClick={() => makeFilesOrMemes(true)}
            >
              Get response
            </button>
          </label>
          <button type="button" onClick={() => makeAgent()}>
            Create agent
          </button>
        </form>
      )}
      <div className="memes">
        {foundMemes.map((meme: Post) => (
          <a
            className="meme"
            href={`/meme/${meme.id}`}
            key={meme.id}
            title={meme.timestamp}
          >
            {/* <ComponentPost post={post}></ComponentPost> */}
          </a>
        ))}
      </div>
    </section>
  );
}
