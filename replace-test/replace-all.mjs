const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const replaceAll = async (haystack, needle, replacer) => {
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
export { replaceAll };
export default replaceAll;
