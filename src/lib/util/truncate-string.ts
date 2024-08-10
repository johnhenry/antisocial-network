const truncate = (str: string, maxLength: number = Infinity): string => {
  if (str.length > maxLength) {
    const truncatedString = str.slice(0, maxLength);
    const lastSpaceIndex = truncatedString.lastIndexOf(" ");
    return truncatedString.slice(0, lastSpaceIndex) + "...";
  }
  return str;
};

/**
 * Truncates a string while preserving HTML boundaries.
 *
 * @param htmtstr - The HTML string to truncate.
 * @param suggesteLength - The suggested length of the truncated string.
 * @returns The truncated string.
 */
export const truncateHTML = (
  htmtstr: string,
  suggesteLength: number = 16,
): string => {
  let truncated = htmtstr;
  let length = 0;
  let inTag = false;
  let inWord = false;
  for (let i = 0; i < htmtstr.length; i++) {
    if (htmtstr[i] === "<") {
      inTag = true;
    } else if (htmtstr[i] === ">") {
      inTag = false;
    } else if (!inTag) {
      if (htmtstr[i] === " ") {
        inWord = false;
      } else {
        if (!inWord) {
          inWord = true;
          length++;
        }
      }
    }
    if (length > suggesteLength) {
      truncated = htmtstr.slice(0, i) + "...";
      break;
    }
  }
  return truncated;
};

export default truncate;
