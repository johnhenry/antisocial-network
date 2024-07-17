import { config } from "dotenv";
config({ path: `.env.local` });
declare const Deno: {
  env: {
    get(name: string): any;
  };
};

const get = typeof process !== "undefined"
  ? (name: string) => {
    return process.env[name];
  }
  : (name: string) => {
    return Deno.env.get(name);
  };

const read = (
  name: string,
  { defaultValue, cast }: { defaultValue?: any; cast?: Function } = {},
) => {
  const val = get(name);
  if (val === undefined) {
    return defaultValue;
  }
  return cast ? cast(val) : val;
};

export { get, read };
