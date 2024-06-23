"use client";
import obfo from "obfo";
import { useRouter } from "next/navigation";

const Page = () => {
  const router = useRouter();
  const documentLoaded = async () => {
    const { file } = obfo(document.querySelector("section"));
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const response = await fetch(
        new Request("/doc/create", {
          method: "POST",
          body: evt.target.result,
          headers: {
            "content-type": file.type,
            "x-filename": file.name,
          },
        })
      );
      const data = await response.json();
      router.push(`/doc/${data.id}`);
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <section data-obfo-container="{}">
      <h2>Docs</h2>
      <input
        title="document"
        name="file"
        type="file"
        data-obfo-cast="file"
        onChange={documentLoaded}
      />
    </section>
  );
};
export default Page;
