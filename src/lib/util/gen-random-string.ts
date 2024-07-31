import crypto from "crypto";

export const genRandSurrealQLString = (...prefixs: string[]) => {
  const randomBytes = crypto.randomBytes(12);
  const parts = [
    randomBytes.readUInt32BE(0).toString(36).padStart(8, "0"),
    randomBytes.readUInt32BE(4).toString(36).padStart(8, "0"),
    randomBytes.readUInt32BE(8).toString(36).padStart(8, "0"),
  ];
  while (prefixs.length) {
    parts.unshift(prefixs.pop() as string);
  }
  return parts.join("");
};

const genRandString = () => Math.floor(Math.random() * 1000000).toString(36);
export default genRandString;
