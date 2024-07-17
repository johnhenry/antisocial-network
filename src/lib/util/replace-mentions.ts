export type MentionCallback = (mention: string) => Promise<string> | string;
const defaultCallback: MentionCallback = (mention) => mention;
const replaceMentions = async (
  text: string,
  replaceCallback: MentionCallback = defaultCallback,
  startSymbols: string[] = ["@", "#"],
  additionalChars = ":\\-",
) => {
  const escapedSymbols = startSymbols
    .map((symbol) => symbol.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
  const escapedChars = additionalChars.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const mentionRegex = new RegExp(
    `(?<=^|\\s)(${escapedSymbols})([\\w${escapedChars}]+)`,
    "g",
  );
  let result = "";
  let lastIndex = 0;

  for (const match of text.matchAll(mentionRegex)) {
    result += text.slice(lastIndex, match.index);
    const replacement = await replaceCallback(match[0]);
    result += replacement;
    lastIndex = match.index + match[0].length;
  }

  result += text.slice(lastIndex);
  return result;
};

export const replaceAndAccumulate = (
  replacer: MentionCallback,
  accumulator: string[][],
) => {
  return async (mention: string) => {
    const replacement = await replacer(mention);
    accumulator.push([mention, replacement]);
    return replacement;
  };
};

export default replaceMentions;