// # test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { parse, stringify } from "./index.mjs";

////////////////
// ## Test: parse
////////////////
test("parse nested multipart message", (t) => {
  const input = `BOUNARY_0
Name: parent
Source: agent:12345
Content-Type: text/plain
Boundary: BOUNARY_1

Parent content
BOUNARY_1
Name: child1
Source: agent:67890

Child 1 content
BOUNARY_1
Name: child2
Source: agent:13579

Child 2 content
BOUNARY_1
BOUNARY_0
Name: sibling
Source: agent:24680

Sibling content
BOUNARY_0`;

  const result = parse(input);

  assert.equal(result.length, 2, "Should have 2 top-level parts");
  assert.equal(result[0][0].Name, "parent");
  assert.equal(result[0][0]._, "Parent content");
  assert.equal(result[0][1].length, 2, "Should have 2 replies");
  assert.equal(result[0][1][0].Name, "child1");
  assert.equal(result[0][1][1].Name, "child2");
  assert.equal(result[1][0].Name, "sibling");
});

test("parse message with multiple file attachments", (t) => {
  const input = `main
Name: message
Source: agent:12345
Boundary: ATTACHMENTS

Message with multiple attachments
ATTACHMENTS
Disposition: attachment
Name: file1.txt
Content-Type: text/plain

Content of file 1
ATTACHMENTS
Disposition: attachment
Name: file2.jpg
Content-Type: image/jpeg
Content-Transfer-Encoding: base64

SGVsbG8=
ATTACHMENTS
main`;

  const result = parse(input);

  assert.equal(result.length, 1, "Should have 1 parts");
  assert.equal(result[0][0].Name, "message");
  assert.equal(result[0][0]._, "Message with multiple attachments");
  assert.equal(result[0][0].attachments.length, 2, "Should have 2 attachments");
  assert.equal(result[0][0].attachments[0].Name, "file1.txt");
  assert.equal(result[0][0].attachments[1].Name, "file2.jpg");
});

test("parse message with empty parts", (t) => {
  const input = `EMPTY
Name: empty1

EMPTY
Name: empty2

EMPTY
Name: nonempty

This part has content
EMPTY`;

  const result = parse(input);

  assert.equal(result.length, 3, "Should have 3 parts");
  assert.equal(result[0][0].Name, "empty1");
  assert.equal(result[0][0]._, undefined);
  assert.equal(result[1][0].Name, "empty2");
  assert.equal(result[1][0]._, undefined);
  assert.equal(result[2][0].Name, "nonempty");
  assert.equal(result[2][0]._, "This part has content");
});

test("parse message with quoted printable content", (t) => {
  const input = `QUOTED
Content-Disposition: post
Name: quoted

This is a long line that=
should be joined.
This line has special characters: ";a"ó😗ý😃{W8ò<L🤨😎6"
QUOTED`;

  const result = parse(input);

  assert.equal(result.length, 1, "Should have 1 part");
  assert.equal(result[0][0].Name, "quoted");
  assert.equal(
    result[0][0]._,
    `This is a long line that=
should be joined.
This line has special characters: ";a"ó😗ý😃{W8ò<L🤨😎6"`
  );
});

test("parse message with deeply nested structure", (t) => {
  const input = `11111
Name: level1
Boundary: 22222

Level 1 content

22222
Name: level2
Boundary: 33333

Level 2 content
33333
Name: level3

Level 3 content
33333
22222
11111`;

  const result = parse(input);
  assert.equal(result.length, 1, "Should have 1 top-level part");
  assert.equal(result[0][0].Name, "level1");
  assert.equal(result[0][0]._, "Level 1 content");
  assert.equal(result[0][1][0].Name, "level2");
  assert.equal(result[0][1][0]._, "Level 2 content");
  assert.equal(result[0][1].length, 2, "Should have 1 deeply nested part");
  assert.equal(result[0][1][1][0].Name, "level3");
  assert.equal(result[0][1][1][0]._, "Level 3 content");
});

test("parse empty message", (t) => {
  const input = `empty
empty`;

  const result = parse(input);

  assert.equal(result[0][0]._, undefined, "Should not produce a body");
});

test("parse message with non-ASCII characters", (t) => {
  const input = `UNICODE
Name: unicode
Content-Type: text/plain

こんにちは世界
UNICODE`;

  const result = parse(input);

  assert.equal(result.length, 1, "Should have 1 part");
  assert.equal(result[0][0].Name, "unicode");
  assert.equal(result[0][0]._, "こんにちは世界");
});

// ////////////////
// // ## Test:stringify
// ////////////////
test("stringify simple multipart message", (t) => {
  const input = [
    [
      {
        name: "part1",
        source: "agent:12345",
        type: "text/plain",
        _: "This is part 1",
      },
    ],
    [
      {
        name: "part2",
        source: "agent:67890",
        type: "text/plain",
        _: "This is part 2",
      },
    ],
  ];

  const result = stringify(input);

  assert(result.includes("name: part1"));
  assert(result.includes("source: agent:12345"));
  assert(result.includes("type: text/plain"));
  assert(result.includes("This is part 1"));
  assert(result.includes("name: part2"));
  assert(result.includes("source: agent:67890"));
  assert(result.includes("This is part 2"));
});

test("stringify message with attachments", (t) => {
  const input = [
    [
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
    ],
  ];

  const result = stringify(input);

  assert(result.includes("name: main"));
  assert(result.includes("Main content"));
  assert(result.includes("Disposition: attachment"));
  assert(result.includes("name: attachment1.txt"));
  assert(result.includes("Attachment 1 content"));
  assert(result.includes("name: attachment2.jpg"));
  assert(result.includes("base64encodedcontent"));
});

test("stringify message with attachments", (t) => {
  const input = [
    [
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
    ],
  ];

  const result = stringify(input);

  assert(result.includes("name: main"));
  assert(result.includes("Main content"));
  assert(result.includes("Disposition: attachment"));
  assert(result.includes("name: attachment1.txt"));
  assert(result.includes("Attachment 1 content"));
  assert(result.includes("name: attachment2.jpg"));
  assert(result.includes("base64encodedcontent"));
});

test("stringify with unicode characters", (t) => {
  const input = [
    [
      {
        name: "unicode",
        _: "This line has special characters: = equals, € euro, 你好 (hello in Chinese)",
      },
    ],
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
    [
      {
        name: "empty1",
        _: "",
      },
    ],
    [
      {
        name: "empty2",
        _: "",
      },
    ],
  ];

  const result = stringify(input);
  assert(result.includes("name: empty1"));
  assert(result.includes("name: empty2"));
});

test("stringify throws error for invalid input", (t) => {
  assert.throws(
    () => {
      stringify({ not: "an array" });
    },
    {
      name: "TypeError",
      message: "parts is not iterable",
    }
  );
});
// ////////////////
// // ## Test: both
// ////////////////

function generateLongString(baseString, repeat) {
  return Array(repeat).fill(baseString).join(" ");
}

test("Long string message", async (t) => {
  const longString = generateLongString(
    "This is a very long message that will be repeated multiple times.",
    20
  );
  const input = [
    [
      {
        name: "long_content",
        type: "text/plain",
        _: longString,
      },
    ],
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
    [
      {
        name: "thread_root",
        type: "text/plain",
        _: "This is the root of a conversation thread.",
      },
      [
        {
          name: "reply1",
          type: "text/plain",
          _: "This is a reply to the root message.",
        },
        [
          {
            name: "reply1_1",
            type: "text/plain",
            _: "This is a reply to the first reply.",
          },
        ],
      ],
    ],
  ];

  const stringified = stringify(nestedStructure, {
    indentation: 2,
  });

  assert(
    stringified.includes("  This is a reply to the root message."),
    "Indentation should be applied to nested content"
  );
});

test("Interaction between parse and stringify", async (t) => {
  const original = [
    [
      {
        name: "parent",
        _: "Parent content",
      },
      [
        {
          name: "child",
          _: "Child content",
        },
        [
          {
            name: "grand-child",
            _: "Grand-child content",
          },
        ],
      ],
    ],
  ];

  const stringified1 = stringify(original, {
    indentation: 2,
  });

  assert(
    stringified1.includes("  Child content"),
    "Second stringify should use new indentation"
  );
  assert(
    stringified1.includes("  Grand-child content"),
    "Second stringify should use new indentation"
  );
});

test("Mixed content types", async (t) => {
  const mixedContent = [
    [
      {
        name: "text_content",
        type: "text/plain",
        _: "This is plain text.",
      },
    ],
    [
      {
        name: "html_content",
        type: "text/html",
        _: "<p>This is HTML</p>",
      },
    ],
    [
      {
        name: "json_content",
        type: "application/json",
        _: JSON.stringify({ key: "value" }),
      },
    ],
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
    [
      {
        name: "unicode_text",
        type: "text/plain",
        _: "Unicode: こんにちは, Здравствуй, مرحبا",
      },
    ],
    [
      {
        name: "special_chars",
        type: "text/plain",
        _: "Special: !@#$%^&*()_+{}|:\"<>?`-=[]\\;',./",
      },
    ],
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
    [
      {
        name: "document",
        type: "text/plain",
        _: "Title: Complex Document",
        attachments: [
          {
            name: "section1",
            type: "text/plain",
            _: "1. Introduction",
          },
          {
            name: "section2",
            type: "text/plain",
            _: "2. Conclusion",
          },
        ],
      },
    ],
  ];

  const stringified = stringify(documentStructure);
  const parsed = parse(stringified);
  assert.deepStrictEqual(
    parsed,
    documentStructure,
    "Parsed result should match the input for complex document structures"
  );
});

test("Empty parts handling", async (t) => {
  const input = [
    [
      {
        name: "empty1",
      },
    ],
    [
      {
        name: "empty2",
      },
    ],
  ];

  const stringified = stringify(input);
  const parsed = parse(stringified);
  assert.deepStrictEqual(
    parsed,
    input,
    "Parsed result should match the input for empty parts"
  );
});
