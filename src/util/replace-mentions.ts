/**
 * Replaces mentions in a text with the result of a callback function.
 *
 * @param {string} text - The text to search for mentions.
 * @param {Function} [callback=defaultCallback] - The callback function to be called for each mention. Default is defaultCallback.
 * @param {string} [prefix="@"] - The prefix used for mentions. Default is "@".
 * @returns {string} The text with mentions replaced.
 *
 * @example
 * ```javascript
 * const callback = (mention) => `<<${mention}>>`; // Example callback function
 * console.log(
 *  await replaceMentions("Hello @john, have you seen @jane's new post?", callback, "@")
 * ); // Output: Hello <<john>>, have you seen <<jane>>'s new post?
 * ```
 *
 * @example
 * ```javascript
 * console.log(
 *  await replaceMentions("Hello@john, have you seen @jane's new post?", callback, "@")
 * ); // Output: Hello@john, have you seen <<jane>>'s new post?
 * ```
 *
 * @example
 * ```javascript
 * console.log(
 *  await replaceMentions("Hello #john, have you seen #jane's new post?", callback, "#")
 * ); // Output: Hello <<john>>, have you seen <<jane>>
 * ```
 */

// TODO: BUG
// If the first character is a "@", it's left in the original string
// That is,
// "@<agent-name> @<agent-name>" is rendered as "@@<agent-id> @<agent-id>" (aditional first "@")
export type MentionCallback = (mention: string) => Promise<string> | string;
const defaultCallback: MentionCallback = (mention) => mention;

const replaceMentions = async (
  text: string,
  callback: MentionCallback = defaultCallback,
  prefix = "@"
): Promise<string> => {
  if (!prefix) {
    return text;
  }
  // Escape the prefix to handle special characters in the regular expression
  const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Use a regular expression to find all mentions with the specified prefix ensuring a word boundary before the prefix and at the start of the word
  // const mentionPattern = new RegExp(`(?:^|\\s)${escapedPrefix}(\\w+)`, "g"); // old pattern does not match colons or hyphens
  const mentionPattern = new RegExp(`(?:^|\\s)${escapedPrefix}([\\w:-]+)`, "g");
  // Collect all matches
  const matches: Array<{ match: string; mention: string; index: number }> = [];
  let match;
  while ((match = mentionPattern.exec(text)) !== null) {
    matches.push({ match: match[0], mention: match[1], index: match.index });
  }

  // Process all matches asynchronously
  const replacements = await Promise.all(
    matches.map(async ({ mention }) => ({
      mention,
      replacement: await callback(mention),
    }))
  );

  // Replace mentions in the original text
  let resultText = text;
  for (let i = replacements.length - 1; i >= 0; i--) {
    const { replacement } = replacements[i];
    const match = matches[i];
    resultText =
      resultText.slice(0, match.index) +
      resultText
        .slice(match.index)
        .replace(match.match, match.match[0] + replacement);
  }

  return resultText;
};

const replaceMentionsSync = (
  text: string,
  callback: MentionCallback = defaultCallback,
  prefix = "@"
) => {
  if (!prefix) {
    return text;
  }
  // Escape the prefix to handle special characters in the regular expression
  const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Use a regular expression to find all mentions with the specified prefix ensuring a word boundary before the prefix and at the start of the word
  const mentionPattern = new RegExp(`(?:^|\\s)${escapedPrefix}(\\w+)`, "g");
  // Replace each mention with the result of the callback function
  return text.replace(mentionPattern, (match, p1) => {
    return match[0] + callback(p1);
  });
};

export default replaceMentions;
export { replaceMentions, replaceMentionsSync };
