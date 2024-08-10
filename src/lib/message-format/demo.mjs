import { stringify } from "./stringify.mjs";
import { parse } from "./parse.mjs";

console.log("Advanced Multipart Message Format Library Demo");
console.log("==============================================");

// Helper function to generate a long string
function generateLongString(baseString, repeat) {
  return Array(repeat).fill(baseString).join(" ");
}

// Helper function to demonstrate stringify and parse
function demonstrateStringifyAndParse(title, input, stringifyOptions = {}) {
  console.log(`\n${title}:`);
  console.log("Input:", JSON.stringify(input, null, 2));

  const stringified = stringify(input, stringifyOptions);
  console.log(stringified);

  const parsed = parse(stringified);
  console.log("Parsed (first part):", JSON.stringify(parsed[0], null, 2));

  console.log(
    "Input matches parsed:",
    JSON.stringify(input) === JSON.stringify(parsed)
  );

  return { stringified, parsed };
}

// 1. Long string message
const longString = generateLongString(
  "This is a very long message that will be repeated multiple times to test the handling of large content in our multipart message format library.",
  20
);

demonstrateStringifyAndParse("1. Long string message", [
  {
    name: "long_content",
    type: "text/plain",
    _: longString,
  },
]);

// // 2. Nested structure with indentation
// const nestedStructure = [
//   {
//     name: "thread_root",
//     type: "text/plain",
//     _: "This is the root of a conversation thread.",
//     attachments: [
//       {
//         name: "reply1",
//         type: "text/plain",
//         _: "This is a reply to the root message.",
//         attachments: [
//           {
//             name: "reply1_1",
//             type: "text/plain",
//             _: "This is a reply to the first reply.",
//           },
//           {
//             name: "reply1_2",
//             type: "text/plain",
//             _: "This is another reply to the first reply.",
//           },
//         ],
//       },
//       {
//         name: "reply2",
//         type: "text/plain",
//         _: "This is another reply to the root message.",
//         attachments: [
//           {
//             name: "reply2_1",
//             type: "text/plain",
//             _: "This is a reply to the second reply.",
//           },
//         ],
//       },
//     ],
//   },
// ];

// const { stringified: indentedString, parsed: indentedParsed } =
//   demonstrateStringifyAndParse(
//     "2. Nested structure with indentation",
//     nestedStructure,
//     {
//       replyIndent: 2,
//       lineEnding: "\n",
//     }
//   );

// // 3. Interaction between parse and stringify
// console.log("\n3. Interaction between parse and stringify:");
// const reparsed = parse(
//   stringify(indentedParsed, { replyIndent: 4, lineEnding: "\r\n" })
// );
// console.log(
//   "Re-parsed structure matches original:",
//   JSON.stringify(nestedStructure) === JSON.stringify(reparsed)
// );

// // 4. Mixed content types
// const mixedContent = [
//   {
//     name: "text_content",
//     type: "text/plain",
//     _: "This is a plain text content.",
//   },
//   {
//     name: "html_content",
//     type: "text/html",
//     _: "<html><body><h1>This is HTML content</h1><p>With some <strong>formatting</strong>.</p></body></html>",
//   },
//   {
//     name: "json_content",
//     type: "application/json",
//     _: JSON.stringify({ key: "value", nested: { array: [1, 2, 3] } }),
//   },
// ];

// demonstrateStringifyAndParse("4. Mixed content types", mixedContent);

// // 5. Unicode and special characters
// const unicodeContent = [
//   {
//     name: "unicode_text",
//     type: "text/plain",
//     _: "Unicode text: こんにちは世界, Здравствуй, мир, مرحبا بالعالم",
//   },
//   {
//     name: "special_chars",
//     type: "text/plain",
//     _: "Special characters: !@#$%^&*()_+{}|:\"<>?`-=[]\\;',./",
//   },
// ];

// demonstrateStringifyAndParse(
//   "5. Unicode and special characters",
//   unicodeContent
// );

// // 6. Simulate a complex document structure
// const documentStructure = [
//   {
//     name: "document",
//     type: "text/plain",
//     _: "Title: Complex Document Structure\n\nThis document demonstrates a complex nested structure with various content types.",
//     attachments: [
//       {
//         name: "section1",
//         type: "text/plain",
//         _: "1. Introduction\n\nThis section introduces the main concepts.",
//         attachments: [
//           {
//             name: "subsection1_1",
//             type: "text/plain",
//             _: "1.1 Background\n\nProvides necessary background information.",
//           },
//           {
//             name: "subsection1_2",
//             type: "text/plain",
//             _: "1.2 Objectives\n\nOutlines the main objectives of the document.",
//           },
//         ],
//       },
//       {
//         name: "section2",
//         type: "text/plain",
//         _: "2. Methodology\n\nThis section describes the methodology used.",
//         attachments: [
//           {
//             name: "subsection2_1",
//             type: "text/plain",
//             _: "2.1 Data Collection\n\nExplains the data collection process.",
//           },
//           {
//             name: "subsection2_2",
//             type: "text/plain",
//             _: "2.2 Data Analysis\n\nDescribes the data analysis techniques employed.",
//           },
//         ],
//       },
//       {
//         name: "section3",
//         type: "text/plain",
//         _: "3. Results and Discussion\n\nThis section presents the results and discusses their implications.",
//       },
//       {
//         name: "section4",
//         type: "text/plain",
//         _: "4. Conclusion\n\nThis section summarizes the main findings and concludes the document.",
//       },
//     ],
//   },
// ];

// const { stringified: documentString, parsed: documentParsed } =
//   demonstrateStringifyAndParse(
//     "6. Complex document structure",
//     documentStructure,
//     {
//       replyIndent: 2,
//       lineEnding: "\n",
//     }
//   );

// console.log("\nComplex Demo completed.");
