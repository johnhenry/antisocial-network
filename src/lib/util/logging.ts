import { LOG_LEVEL } from "@/config/mod";
const { log, error } = console;
export { error, error as printError, log, log as print };
export const systemLog = (...any: string[]) => LOG_LEVEL && log(...any);
export default systemLog;
export const systemError = (...any: string[]) => LOG_LEVEL && error(...any);
