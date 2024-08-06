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

// console.log(indent(2)`
// First line
// Second line
// Third line
// `);

// console.log(indent("\t")`

// Hola, ¿cómo estás?
// Este es un ejemplo con español.
// Y también incluye un emoji: 😄

// `);

// console.log(indent("🌈")`
// This example
// has no blank lines
// at the beginning or end
// but it does have
// a blank line in the middle

// just like this
// `);

// console.log(indent("-->")`
// Paragraph 1, sentence 1. Paragraph 1, sentence 2.

// Paragraph 2, sentence 1. Paragraph 2, sentence 2. Paragraph 2, sentence 3.
// `);

// console.log(indent(3)`No blank lines at all.`);

// console.log(indent(4)`
// Blank line above.
// No blank line below.`);

// console.log(indent(5)`Blank line below.

// `);

// console.log(indent(6)`
// Blank lines
// above and below.

// `);

// console.log(indent(0)`Zero indentation.`);

// console.log(
//   indent(
//     2,
//   )`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed auctor, magna a bibendum bibendum, augue magna tincidunt enim, eget vestibulum justo augue at purus.`,
// );

// console.log(indent(4)`
// Vivamus vitae orci quis ante viverra ultricies ut eget turpis. Nullam in elit eget mauris pharetra volutpat vitae non lorem. Praesent in ex auctor, fringilla sapien nec, tincidunt nisi.

// Sed nec velit sit amet quam malesuada fringilla. Nunc posuere, velit id tincidunt ultrices, leo dolor pharetra risus, sit amet eleifend felis neque nec risus. 😊
// `);

// console.log(indent("\t")`
//   Aliquam erat volutpat. 🌍 Nunc fringilla metus odio, non ultrices nunc tempor nec. Sed tincidunt ex eget bibendum volutpat. Donec eleifend orci sit amet ipsum egestas, vitae vulputate est convallis.

//   Sed id magna a felis accumsan laoreet. Duis ac tellus turpis. Nullam consequat commodo urna, sed semper purus fringilla non.
// `);

// console.log(
//   indent(
//     "-->",
//   )`El veloz murciélago hindú comía feliz cardillo y kiwi. La cigüeña tocaba el saxofón detrás del palenque de paja.`,
// );

// console.log(indent(8)`
// Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Sed euismod dui at bibendum facilisis. Vivamus tincidunt risus in enim dapibus, id posuere justo tincidunt.

// Duis vehicula metus tellus, sit amet aliquam orci euismod at. Sed vel ipsum a tellus eleifend imperdiet. Sed malesuada ex sit amet dui efficitur aliquam. 🎉
// `);

// console.log(indent(3)`No blank lines at all. Just a single line of text.`);

// console.log(indent(4)`
// Blank line above.
// And another line of text.`);

// console.log(indent(5)`A line of text.
// And a blank line below.

// `);

// console.log(indent("🚀")`
//   Outer space is filled with wonder and mystery. 🌌
//   From the countless stars that dot the night sky to the distant planets that orbit them, the universe is a vast and awe-inspiring place. 🪐

//   As we continue to explore and study the cosmos, we uncover new insights into the fundamental laws of nature and our place within it. 🔭
// `);

// console.log(indent(0)`Zero indentation. But with a blank line below.

// `);

// console.log(indent(2)`

// Here is a quote from Albert Einstein:
// ${indent(
//   2,
// )`"Imagination is more important than knowledge.
// For knowledge is limited, whereas imagination embraces the entire world, stimulating progress, giving birth to evolution."`}

// `);
