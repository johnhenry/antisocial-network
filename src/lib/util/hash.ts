import { createHash } from "crypto";
import { genRandSurrealQLString } from "@/lib/util/gen-random-string";

export default function getBase64Hash(
  input: string | Buffer = genRandSurrealQLString(),
): string {
  const hash = createHash("sha256").update(input).digest("base64");
  return hash;
}
