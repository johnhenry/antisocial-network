const addBreakingSpaces = (
  str: string,
  N = 10,
  i = 0,
  breakingSpace = "\u200B",
) => {
  if (i < 0 || i >= str.length) {
    throw new Error("Invalid starting index.");
  }

  const insertBreakingSpace = (s, index, space) =>
    s.slice(0, index) + space + s.slice(index);

  let result = str;
  for (let j = i + N; j < result.length; j += N + 1) {
    result = insertBreakingSpace(result, j, breakingSpace);
  }

  return result;
};

export default addBreakingSpaces;
