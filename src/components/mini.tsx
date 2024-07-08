import Image from "next/image";

import imageFromString from "@/util/image-from-string";

export const MiniFile = ({ file }: any) => {
  const image = file.type.startsWith("image/") ? (
    <Image
      src={`/file/${file.id}/raw`}
      alt={file.name}
      width="128"
      height="128"
    />
  ) : null;
  const content = file.content ? <div>{file.content}</div> : null;
  return (
    <li className="file">
      <a href={`/file/${file.id}`}>
        <main>
          <div>{content}</div> {image}
        </main>
        <aside>
          <span>{file.name}</span>
          <span>{file.type}</span>
        </aside>
      </a>
    </li>
  );
};
export const MiniAgent = ({ agent }: any) => {
  const image = (
    <Image
      src={
        agent.image
          ? `/file/${agent.image}/raw`
          : `data:image/png;base64, ${imageFromString(agent.hash)}`
      }
      alt={agent.name}
      width="128"
      height="128"
    />
  );
  return (
    <li className="agent">
      <a href={`/agent/${agent.id}`}>
        <aside title={agent.id}>{agent.name}</aside>
        <main>
          {image} <div>{agent.content}</div>
        </main>
      </a>
    </li>
  );
};
export const MiniMeme = ({ meme }: any) => {
  const aside = meme.source ? (
    meme.source.id.startsWith("agent:") ? (
      <aside className="posted-by">
        {" "}
        <a href={`/agent/${meme.source.id}`}>@{meme.source.name}</a>
      </aside>
    ) : (
      <aside className="found-in">
        <a href={`/file/${meme.source.id}`}>{meme.source.name}</a>
      </aside>
    )
  ) : null;

  return (
    <li key={meme.id} className="meme">
      <main>
        <a href={`/meme/${meme.id}`} key={meme.id} title={meme.timestamp}>
          <span>“</span>
          <div
            className="tamed-html"
            dangerouslySetInnerHTML={{ __html: meme.content }}
          ></div>
          <span>”</span>
        </a>
      </main>
      {aside}
    </li>
  );
};
