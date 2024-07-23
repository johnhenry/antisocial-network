import type { FC, ReactNode, ComponentClass } from "react";
import type { FileExt } from "@/types/mod";
import Image from "next/image";
type AttachmentProps = {
  file: FileExt;
};
const Attachment: FC<AttachmentProps> = ({ file }) => {
  const body = file.type.startsWith("image/") ? (
    <Image
      src={`/file/${file.id}/raw`}
      width="256"
      height="256"
      alt={file.content}
      title={file.content}
    />
  ) : (
    <iframe
      src={`/file/${file.id}/raw`}
      width="256"
      title={file.content}
    ></iframe>
  );

  return <a href={`/file/${file.id}`}>{body}</a>;
};
export default Attachment;
