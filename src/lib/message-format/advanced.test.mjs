import { test } from "node:test";
import assert from "node:assert/strict";
import { stringify } from "./stringify.mjs";
import { parse } from "./parse.mjs";

function generateLongString(baseString, repeat) {
  return Array(repeat).fill(baseString).join(" ");
}

test("Long string message", async (t) => {
  const longString = generateLongString(
    "This is a very long message that will be repeated multiple times.",
    20
  );
  const input = [
    {
      name: "long_content",
      type: "text/plain",
      _: longString,
    },
  ];

  const stringified = stringify(input);
  const parsed = parse(stringified);

  assert.deepStrictEqual(
    parsed,
    input,
    "Parsed result should match the input for long strings"
  );
  assert(stringified.length > 1000, "Stringified content should be very long");
});

test("Nested structure with indentation", async (t) => {
  const nestedStructure = [
    {
      name: "thread_root",
      type: "text/plain",
      _: "This is the root of a conversation thread.",
      attachments: [
        {
          name: "reply1",
          type: "text/plain",
          _: "This is a reply to the root message.",
          attachments: [
            {
              name: "reply1_1",
              type: "text/plain",
              _: "This is a reply to the first reply.",
            },
          ],
        },
      ],
    },
  ];

  const stringified = stringify(nestedStructure, {
    replyIndent: 2,
    lineEnding: "\n",
  });
  const parsed = parse(stringified);

  assert.deepStrictEqual(
    parsed,
    nestedStructure,
    "Parsed result should match the input for nested structures"
  );
  assert(
    stringified.includes("  This is a reply to the root message."),
    "Indentation should be applied to nested content"
  );
});

test("Interaction between parse and stringify", async (t) => {
  const original = [
    {
      name: "parent",
      _: "Parent content",
      attachments: [
        {
          name: "child",
          _: "Child content",
        },
      ],
    },
  ];

  const stringified1 = stringify(original, {
    replyIndent: 2,
    lineEnding: "\n",
  });
  const parsed1 = parse(stringified1);
  const stringified2 = stringify(parsed1, {
    replyIndent: 4,
    lineEnding: "\r\n",
  });
  const parsed2 = parse(stringified2);

  assert.deepStrictEqual(
    parsed2,
    original,
    "Double parse-stringify should preserve structure"
  );
  assert(
    stringified2.includes("    Child content"),
    "Second stringify should use new indentation"
  );
});

test("Mixed content types", async (t) => {
  const mixedContent = [
    {
      name: "text_content",
      type: "text/plain",
      _: "This is plain text.",
    },
    {
      name: "html_content",
      type: "text/html",
      _: "<p>This is HTML</p>",
    },
    {
      name: "json_content",
      type: "application/json",
      _: JSON.stringify({ key: "value" }),
    },
  ];

  const stringified = stringify(mixedContent);
  const parsed = parse(stringified);

  assert.deepStrictEqual(
    parsed,
    mixedContent,
    "Parsed result should match the input for mixed content types"
  );
});

test("Unicode and special characters", async (t) => {
  const unicodeContent = [
    {
      name: "unicode_text",
      type: "text/plain",
      _: "Unicode: こんにちは, Здравствуй, مرحبا",
    },
    {
      name: "special_chars",
      type: "text/plain",
      _: "Special: !@#$%^&*()_+{}|:\"<>?`-=[]\\;',./",
    },
  ];

  const stringified = stringify(unicodeContent);
  const parsed = parse(stringified);

  assert.deepStrictEqual(
    parsed,
    unicodeContent,
    "Parsed result should match the input for unicode and special characters"
  );
});

test("Complex document structure", async (t) => {
  const documentStructure = [
    {
      name: "document",
      type: "text/plain",
      _: "Title: Complex Document",
      attachments: [
        {
          name: "section1",
          type: "text/plain",
          _: "1. Introduction",
          attachments: [
            {
              name: "subsection1_1",
              type: "text/plain",
              _: "1.1 Background",
            },
          ],
        },
        {
          name: "section2",
          type: "text/plain",
          _: "2. Conclusion",
        },
      ],
    },
  ];

  const stringified = stringify(documentStructure, {
    replyIndent: 2,
    lineEnding: "\n",
  });
  const parsed = parse(stringified);

  assert.deepStrictEqual(
    parsed,
    documentStructure,
    "Parsed result should match the input for complex document structures"
  );
  assert(
    stringified.includes("  1. Introduction"),
    "Indentation should be applied to document sections"
  );
  assert(
    stringified.includes("    1.1 Background"),
    "Indentation should be applied to subsections"
  );
});

test("Empty parts handling", async (t) => {
  const input = [
    {
      name: "empty1",
      _: "",
    },
    {
      name: "empty2",
    },
  ];

  const stringified = stringify(input);
  const parsed = parse(stringified);

  assert.deepStrictEqual(
    parsed,
    input,
    "Parsed result should match the input for empty parts"
  );
});

test("Custom options", async (t) => {
  const input = [
    {
      name: "custom",
      _: "First line\nSecond line",
    },
  ];

  const stringified = stringify(input, {
    showBoundaries: false,
    replyIndent: 2,
    lineEnding: "\r\n",
  });

  assert(
    !stringified.includes("--"),
    "Boundaries should not be shown when showBoundaries is false"
  );
  assert(
    stringified.includes("First line\r\n  Second line"),
    "Custom line ending and indentation should be applied"
  );

  const parsed = parse(stringified);
  assert.deepStrictEqual(
    parsed,
    input,
    "Parsed result should match the input with custom options"
  );
});
