"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import useDebouncedEffect from "@/lib/hooks/use-debounce";
import { searchMemes } from "@/lib/database/search";
import OmniForm from "@/components/omniform";
import truncate from "@/util/truncate-string";

const MiniMeme = ({ meme }: any) => <>{truncate(meme.content, 128)}</>;
const MiniFile = ({ file }: any) => <>{truncate(file.content, 128)}</>;
const MiniAgent = ({ agent }: any) => <>{truncate(agent.content, 128)}</>;

export default function Home() {
  // Search Results
  const [foundMemes, setFoundMemes] = useState<any[]>([]);
  const [foundFiles, setFoundFiles] = useState<any[]>([]);
  const [foundAgents, setFoundAgents] = useState<any[]>([]);
  const [text, setText] = useState<string>("");
  const router = useRouter();
  const memeCreated = (id: string) => {
    alert("meme created: " + id);
    router.push(`/meme/${id}`);
  };
  const filesCreated = (ids: string[]) => {
    alert("File created: " + ids.join(", "));
    // create files;
    router.push(`/file/${ids[0]}`);
  };
  const agentCreated = (id: string) => {
    alert("agent created: " + id);
    router.push(`/agent/${id}`);
  };
  useDebouncedEffect(
    () => {
      const search = async () => {
        if (text.trim().length > 3) {
          const [memes, agents, files]: any[][] = await searchMemes(text);
          setFoundMemes(memes);
          setFoundAgents(agents);
          setFoundFiles(files);
        } else {
          setFoundMemes([]);
          setFoundAgents([]);
          setFoundFiles([]);
        }
      };
      search();
      return () => {
        // cleanup
      };
    },
    [text],
    500
  );

  return (
    <section>
      {/* <ComponentPostCreate newPostCreated={newPostCreated} /> */}
      <OmniForm
        memeCreated={memeCreated}
        filesCreated={filesCreated}
        agentCreated={agentCreated}
        text={text}
        setText={setText}
      />
      {foundMemes.length ? (
        <>
          <h2>Memes</h2>
          <ul className="search-results">
            {foundMemes.map((meme) => (
              <li key={meme.id}>
                <a
                  className="meme"
                  href={`/meme/${meme.id}`}
                  key={meme.id}
                  title={meme.timestamp}
                >
                  <MiniMeme meme={meme} />
                </a>
              </li>
            ))}
          </ul>
        </>
      ) : null}
      {foundFiles.length ? (
        <>
          <h2>Files</h2>
          <ul className="search-results">
            {foundFiles.map((file) => (
              <li key={file.id}>
                <a
                  className="file"
                  href={`/file/${file.id}`}
                  key={file.id}
                  title={file.timestamp}
                >
                  <MiniFile file={file} />
                </a>
              </li>
            ))}
          </ul>
        </>
      ) : null}
      {foundAgents.length ? (
        <>
          <h2>Agents</h2>
          <ul className="search-results">
            {foundAgents.map((agent) => (
              <li key={agent.id}>
                <a
                  className="meme"
                  href={`/agent/${agent.id}`}
                  key={agent.id}
                  title={agent.timestamp}
                >
                  <MiniAgent agent={agent} />
                </a>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}
