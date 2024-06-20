"use client";
import type { FC } from "react";
import type { Meme } from "@/types/post_client";
import { useState, useEffect } from "react";
import { getMeme } from "@/lib/actions.meme";
import obfo from "obfo";
import { updateMeme } from "@/lib/actions.meme";

type Params = {
  params: {
    id: string;
  };
};

const Page: FC<Params> = ({ params }) => {
  const identifier = decodeURIComponent(params.id || "");
  const [meme, setMeme] = useState<Meme | null>(null);
  useEffect(() => {
    const loadMeme = async () => {
      const meme = await getMeme(identifier);
      setMeme(meme);
    };
    loadMeme();
    return () => {
      // cleanup
    };
  }, [identifier]);

  if (!meme) {
    return (
      <section>
        <h2>Loading...</h2>
      </section>
    );
  }

  return (
    <section className="section-meme">
      <h2>Meme</h2>
      <div>
        <p>Hash: {meme.hash}</p>
        <p>{meme.timestamp}</p>
        <pre>{meme.content}</pre>
      </div>
      <h2>Agents</h2>
    </section>
  );
};
export default Page;
