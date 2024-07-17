import * as SETTINGS from "@/config/mod";
const { log } = console;

Object.entries(SETTINGS).forEach(([key, value]) => {
  log(key, value);
});
