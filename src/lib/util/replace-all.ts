export type ReplacerFunction = (
  match?: RegExpExecArray,
  index?: number,
  haystack?: string,
  [start, end]?: [number, number],
) => string | Promise<string>;

const escapeRegExp = (string: string) =>
  string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
export const replaceAll = async (
  haystack: string,
  needle: string | RegExp,
  replacer: ReplacerFunction,
) => {
  if (typeof needle === "string") {
    needle = new RegExp(escapeRegExp(needle), "g");
  }
  const matches = [...haystack.matchAll(needle)];
  if (matches.length === 0) {
    return haystack;
  }
  const replacements = await Promise.all(
    matches.map(async (match, index) => {
      const start = match.index;
      const end = match.index + match[0].length;
      const replacement = await replacer(match, index, haystack, [start, end]);
      return { start, end, replacement };
    }),
  );
  let result = "";
  let lastIndex = 0;
  for (const { start, end, replacement } of replacements) {
    result += haystack.slice(lastIndex, start) + replacement;
    lastIndex = end;
  }
  result += haystack.slice(lastIndex);
  return result;
};
export const replaceAller = async (
  haystack: string,
  needle: string | RegExp,
  ...replacers: ReplacerFunction[]
) => {
  if (typeof needle === "string") {
    needle = new RegExp(escapeRegExp(needle), "g");
  }
  const matches = [...haystack.matchAll(needle)];
  if (matches.length === 0) {
    return haystack;
  }
  const REPLACEMENTS = await Promise.all(
    matches.map(async (match, index) => {
      const start = match.index;
      const end = match.index + match[0].length;
      const replacements = await Promise.all(
        replacers.map(async (replacer) => {
          const replacement = await replacer(match, index, haystack, [
            start,
            end,
          ]);
          return { start, end, replacement };
        }),
      );
      return replacements;
    }),
  );
  const results = [];
  for (const replacements of REPLACEMENTS) {
    let result = "";
    let lastIndex = 0;
    for (const { start, end, replacement } of replacements) {
      result += haystack.slice(lastIndex, start) + replacement;
      lastIndex = end;
    }
    result += haystack.slice(lastIndex);
    results.push(result);
  }
  return results;
};

export default replaceAll;
