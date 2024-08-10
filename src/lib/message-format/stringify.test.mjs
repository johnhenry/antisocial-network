import { test } from "node:test";
import assert from "node:assert/strict";
import { stringify } from "./stringify.mjs";

test("stringify simple multipart message", (t) => {
  const input = [
    {
      name: "part1",
      source: "agent:12345",
      type: "text/plain",
      _: "This is part 1",
    },
    {
      name: "part2",
      source: "agent:67890",
      type: "text/plain",
      _: "This is part 2",
    },
  ];

  const result = stringify(input);

  assert(result.includes("Content-Disposition: post"));
  assert(result.includes("Name: part1"));
  assert(result.includes("Source: agent:12345"));
  assert(result.includes("Content-Type: text/plain"));
  assert(result.includes("This is part 1"));
  assert(result.includes("Name: part2"));
  assert(result.includes("Source: agent:67890"));
  assert(result.includes("This is part 2"));
});

test("stringify message with attachments", (t) => {
  const input = [
    {
      name: "main",
      type: "text/plain",
      _: "Main content",
      attachments: [
        {
          name: "attachment1.txt",
          type: "text/plain",
          _: "Attachment 1 content",
        },
        {
          name: "attachment2.jpg",
          type: "image/jpeg",
          _: "base64encodedcontent",
        },
      ],
    },
  ];

  const result = stringify(input);

  assert(result.includes("Name: main"));
  assert(result.includes("Main content"));
  assert(result.includes("Content-Disposition: file"));
  assert(result.includes("Name: attachment1.txt"));
  assert(result.includes("Attachment 1 content"));
  assert(result.includes("Name: attachment2.jpg"));
  assert(result.includes("base64encodedcontent"));
});

test("stringify with custom options", (t) => {
  const input = [
    {
      name: "part1",
      _: "Content with\nnew lines",
    },
  ];

  const result = stringify(input, {
    showBoundaries: false,
    replyIndent: 2,
    lineEnding: "\r\n",
  });

  console.log("Result:", JSON.stringify(result));

  assert(!result.includes("--"));
  assert(result.includes("Content-Disposition: post\r\n"));
  assert(result.includes("Name: part1\r\n"));
  assert(result.includes("Content with\r\n  new lines"));
});
test("stringify with unicode characters", (t) => {
  const input = [
    {
      name: "unicode",
      _: "This line has special characters: = equals, € euro, 你好 (hello in Chinese)",
    },
  ];

  const result = stringify(input);

  assert(
    result.includes(
      "This line has special characters: = equals, € euro, 你好 (hello in Chinese)"
    )
  );
});

test("stringify empty parts", (t) => {
  const input = [
    {
      name: "empty1",
      _: "",
    },
    {
      name: "empty2",
    },
  ];

  const result = stringify(input);

  assert(result.includes("Name: empty1"));
  assert(result.includes("Name: empty2"));
});

test("stringify throws error for invalid input", (t) => {
  assert.throws(
    () => {
      stringify({ not: "an array" });
    },
    {
      name: "Error",
      message: "Input must be an array of parts",
    }
  );
});
