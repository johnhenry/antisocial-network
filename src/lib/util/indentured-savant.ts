// https://2ality.com/2016/11/computing-tag-functions.html

const cook = (
  strs: TemplateStringsArray | string | string[],
  ...substs: string[]
) => {
  return substs.reduce((prev, cur, i) => prev + cur + strs[i + 1], strs[0]);
};

const indenturedServant = (indentValue: string | number = 0) => {
  const header = typeof indentValue === "number"
    ? " ".repeat(indentValue)
    : indentValue;
  return (
    strings: TemplateStringsArray | string | string[],
    ...values: string[]
  ): string => {
    return cook(strings, ...values)
      .split("\n").map((line) => {
        return `${header}${line}`;
      }).join("\n");
  };
};

export { indenturedServant };

export default indenturedServant;
