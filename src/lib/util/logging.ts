import { consola, createConsola } from "consola";
import { LOG_LEVEL } from "@/config/mod";
const { log, table } = console;
export const LogTable = createConsola({
  level: LOG_LEVEL,
  reporters: [
    {
      log: (tabularData) => {
        table(tabularData);
      },
    },
  ],
});

export const LogJson = createConsola({
  level: LOG_LEVEL,

  reporters: [
    {
      log: (object: Record<string, any>) => {
        log(JSON.stringify(object, null, " "));
      },
    },
  ],
});

consola.level = LOG_LEVEL;
export default consola;
