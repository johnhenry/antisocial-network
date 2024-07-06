import Identicon from "identicon.js";
const base64ToHex = (base64:string) => {
  const raw = Buffer.from(base64, "base64");
  let hex = "";
  for (let i = 0; i < raw.length; i++) {
    const hexChar = raw[i].toString(16).padStart(2, "0");
    hex += hexChar;
  }
  return hex;
};
const convert = (value: string, size = 256) =>
  new Identicon(base64ToHex(value), size).toString();
export default convert;
