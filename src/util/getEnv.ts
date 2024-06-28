import { config } from "dotenv";
config({ path: `.env.local` });

const get =
  typeof process !== "undefined"
    ? (name) => {
        return process.env[name];
      }
    : (name) => {
        return Deno.env.get(name);
      };

const read = (
  name: string,
  { defaultValue, cast }: { defaultValue?: any; cast?: Function } = {}
) => {
  const val = get(name);
  if (val === undefined) {
    return defaultValue;
  }
  return cast ? cast(val) : val;
};

export { read, get };
