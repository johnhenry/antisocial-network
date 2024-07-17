import parser from "yargs-parser";

/**
 * Options for the parser.
 */
const parserOptions = {
  string: ["bar"],
};
/**
 * Parses a command string and returns the parsed result.
 *
 * @param command - The command string to parse.
 * @returns void.
 */
export const processCommand = (command = "") => {
  const parsed = parser(command, parserOptions);
  // TODO: Implenet command processing
  console.log(parsed);
};

export default processCommand;
