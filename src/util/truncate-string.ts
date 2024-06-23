const truncateLegacy = (str: string, words: number): string => {
  const stringArray = str.split(" ");
  if (stringArray.length > words) {
    return stringArray.slice(0, words).join(" ") + "...";
  }
  return stringArray.join(" ");
};

const truncate = (str: string, maxLength: number = Infinity): string => {
  if (str.length > maxLength) {
    const truncatedString = str.slice(0, maxLength);
    const lastSpaceIndex = truncatedString.lastIndexOf(" ");
    return truncatedString.slice(0, lastSpaceIndex) + "...";
  }
  return str;
};

export default truncate;
