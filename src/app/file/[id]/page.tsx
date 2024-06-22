"use client";
import { useEffect, useState } from "react";
import { getFile } from "@/lib/database/read";

import Image from "next/image";

const Page = ({ params }) => {
  const [file, setFile] = useState(null);
  const indetifier = decodeURIComponent(params.id || "");
  useEffect(() => {
    const fetchFile = async () => {
      const file = await getFile(indetifier);
      setFile(file);
    };
    fetchFile();
  }, [indetifier]);

  if (!file) {
    return <section>Loading...</section>;
  }
  return (
    <section>
      <form className="form-update">
        <label>
          name <input defaultValue={file.name} />
        </label>
        <label>
          author <input defaultValue={file.author} />
        </label>
        <label>
          publisher <input defaultValue={file.publisher} />
        </label>
        <label>
          publish date <input type="date" defaultValue={file.publishDate} />
        </label>
        <label>
          type <div>{file.type}</div>
        </label>
        <label>
          content <div>{file.content}</div>
        </label>
        {file.type.startsWith("image/") ? (
          <Image src={`/file/${file.id}/raw`} width="128" height="128"></Image>
        ) : null}
        <a href={`/file/${file.id}/raw`} download={file.name}>
          download
        </a>
        <label>hash {file.hash}</label>
        <label>timestamp {file.timestamp}</label>
      </form>
    </section>
  );
};

export default Page;
