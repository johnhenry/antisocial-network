const truncate = (str: string, words: number): string => {
  const stringArray = str.split(" ");
  if (stringArray.length > words) {
    return stringArray.slice(0, words).join(" ") + "...";
  }
  return stringArray.join(" ");
};

export default truncate;
