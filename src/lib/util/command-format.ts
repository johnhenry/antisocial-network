/**
 * Checks if a string is a command.
 * @param string - The string to check.
 * @returns True if the string is a command, false otherwise.
 */
export const isSlashCommand = (string = "") =>
  string.trimStart().startsWith("/");
/**
 * Trims the command string by removing leading and trailing whitespace,
 * as well as the first character.
 *
 * @param string - The command string to be trimmed.
 * @returns The trimmed command string.
 */
export const trimSlashCommand = (string = "") =>
  string.trimStart().slice(1).trimStart();
