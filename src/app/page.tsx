"use client";
import type { Agent } from "@/types/types";
import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import useDebouncedEffect from "@/lib/hooks/use-debounce";
import { searchMemes } from "@/lib/database/search";
import OmniForm from "@/components/omniform";
import truncate from "@/util/truncate-string";
import { MASQUERADE_KEY } from "@/settings";
import useLocalStorage from "@/lib/hooks/use-localstorage";
import Masquerade from "@/components/masquerade";
const MiniFile = ({ file }: any) => <>{truncate(file.content, 128)}</>;
const MiniAgent = ({ agent }: any) => (
  <>
    @{agent.name}:{truncate(agent.content, 128)}
  </>
);

export default function Home() {
  const [masquerade, setMasquerade] = useLocalStorage<Agent | null>(
    MASQUERADE_KEY,
    null
  );
  // Search Results
  const [foundMemes, setFoundMemes] = useState<any[]>([]);
  const [foundFiles, setFoundFiles] = useState<any[]>([]);
  const [foundAgents, setFoundAgents] = useState<any[]>([]);
  const [text, setText] = useState<string | undefined>();
  const [searchSize, setSearchSize] = useState<number>(1);
  const router = useRouter();
  const resourceCreated = (id: string, content: string = "") => {
    const [type] = id.split(":", 1);
    if (confirm(`open ${id}?` + "\n" + content)) {
      router.push(`/${type}/${id}`);
    }
  };
  const searchSizeChange = (event: any) => {
    setSearchSize(Number(event.target.value));
  };
  useEffect(() => {
    setText("");
    return () => {
      // cleanup
    };
  }, []);

  useDebouncedEffect(
    () => {
      const search = async () => {
        const [memes, agents, files]: any[][] = await searchMemes(
          text || `${Math.random()}`.slice(2),
          {
            knn: searchSize,
          }
        );
        setFoundMemes(memes);
        setFoundAgents(agents);
        setFoundFiles(files);
      };
      search();
      return () => {
        // cleanup
      };
    },
    [text, searchSize],
    750
  );

  return (
    <section>
      <Masquerade
        masquerade={masquerade}
        setMasquerade={setMasquerade}
        className="agent-masquerade"
      />
      <OmniForm
        resourceCreated={resourceCreated}
        text={text}
        agent={masquerade?.id}
        setText={setText}
      />
      <input
        type="range"
        min="1"
        max="100"
        onChange={searchSizeChange}
        value={searchSize}
      />
      <Suspense fallback={<>Loading...</>}>
        {foundMemes.length ? (
          <>
            <h2>Memes</h2>
            <ul className="search-results">
              {foundMemes.map((meme) => (
                <li key={meme.id}>
                  <a
                    className="meme"
                    className="tamed-html"
                    href={`/meme/${meme.id}`}
                    key={meme.id}
                    title={meme.timestamp}
                    dangerouslySetInnerHTML={{ __html: meme.content }}
                  ></a>
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
                    className="agent"
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
      </Suspense>
    </section>
  );
}
