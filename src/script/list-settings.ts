import * as SETTINGS from "@/settings";
const { log } = console;

Object.entries(SETTINGS).forEach(([key, value]) => {
  log(key, value);
});
