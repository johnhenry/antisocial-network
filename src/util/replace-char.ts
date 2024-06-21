const replaceChar = (
  stringFrom = "0123456789",
  stringTo = "abcdefghij",
  empty?: string
) => {
  // Create a mapping object
  const map: Record<string, string> = {};
  for (let i = 0; i < stringFrom.length; i++) {
    map[stringFrom[i]] = stringTo[i];
  }
  if (empty) {
    map[empty] = "";
  }

  // Return the function that performs the replacement
  return (str: string) =>
    str
      .split("")
      .map((char) => map[char] ?? char)
      .join("");
};
export const replaceDigits = replaceChar();
export const replaceNumber = (int: number) =>
  replaceChar(undefined, undefined, ".")(int.toString());
export default replaceChar;
