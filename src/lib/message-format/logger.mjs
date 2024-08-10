export function createLogger(module) {
  return {
    debug: (message) => console.log(`[DEBUG] [${module}] ${message}`),
    info: (message) => console.log(`[INFO] [${module}] ${message}`),
    warn: (message) => console.warn(`[WARN] [${module}] ${message}`),
    error: (message) => console.error(`[ERROR] [${module}] ${message}`),
  };
}
