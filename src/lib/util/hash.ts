import { createHash } from "crypto";

export default function getBase64Hash(input: string | Buffer): string {
  const hash = createHash("sha256").update(input).digest("base64");
  return hash;
}
