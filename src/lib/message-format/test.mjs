// # test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { parse, stringify } from "./index.mjs";

////////////////
// ## Test: parse
////////////////
test("parse nested multipart message", (t) => {
  const input = `--outer
Content-Disposition: post
Name: parent
Source: agent:12345
Content-Type: text/plain
Boundary: inner

Parent content

--inner
Content-Disposition: post
Name: child1
Source: agent:67890

Child 1 content
--inner
Content-Disposition: post
Name: child2
Source: agent:13579

Child 2 content
--inner--
--outer
Content-Disposition: post
Name: sibling
Source: agent:24680

Sibling content
--outer--`;

  const result = parse(input);

  assert.equal(result.length, 2, "Should have 2 top-level parts");
  assert.equal(result[0].name, "parent");
  assert.equal(result[0]._, "Parent content");
  assert.equal(result[0].nested.length, 2, "Should have 2 nested parts");
  assert.equal(result[0].nested[0].name, "child1");
  assert.equal(result[0].nested[1].name, "child2");
  assert.equal(result[1].name, "sibling");
});

test("parse message with multiple file attachments", (t) => {
  const input = `--main
Content-Disposition: post
Name: message
Source: agent:12345

Message with multiple attachments

--main
Content-Disposition: file
Name: file1.txt
Content-Type: text/plain

Content of file 1
--main
Content-Disposition: file
Name: file2.jpg
Content-Type: image/jpeg
Content-Transfer-Encoding: base64

SGVsbG8=
--main--`;

  const result = parse(input);

  assert.equal(result.length, 3, "Should have 3 parts");
  assert.equal(result[0].name, "message");
  assert.equal(result[0]._, "Message with multiple attachments");
  assert.equal(result[1].attachments.length, 1, "Should have 1 attachment");
  assert.equal(result[1].attachments[0].name, "file1.txt");
  assert.equal(result[2].attachments.length, 1, "Should have 1 attachment");
  assert.equal(result[2].attachments[0].name, "file2.jpg");
});

test("parse message with empty parts", (t) => {
  const input = `--empty
Content-Disposition: post
Name: empty1

--empty
Content-Disposition: post
Name: empty2

--empty
Content-Disposition: post
Name: nonempty

This part has content
--empty--`;

  const result = parse(input);

  assert.equal(result.length, 3, "Should have 3 parts");
  assert.equal(result[0].name, "empty1");
  assert.equal(result[0]._, "");
  assert.equal(result[1].name, "empty2");
  assert.equal(result[1]._, "");
  assert.equal(result[2].name, "nonempty");
  assert.equal(result[2]._, "This part has content");
});

test("parse message with inconsistent line endings", (t) => {
  const input =
    "--mix\r\nContent-Disposition: post\nName: part1\r\n\r\nContent with\nmixed\r\nline endings\r\n--mix\nContent-Disposition: post\r\nName: part2\n\nMore\r\ncontent\n--mix--";

  const result = parse(input);

  assert.equal(result.length, 2, "Should have 2 parts");
  assert.equal(result[0].name, "part1");
  assert.equal(result[0]._, "Content with\nmixed\r\nline endings");
  assert.equal(result[1].name, "part2");
  assert.equal(result[1]._, "More\r\ncontent");
});

test("parse message with quoted printable content", (t) => {
  const input = `--quote
Content-Disposition: post
Name: quoted
Content-Transfer-Encoding: quoted-printable

This is a long line that=
 should be joined.
This line has special characters: =3D equals, =20 space
--quote--`;

  const result = parse(input);

  assert.equal(result.length, 1, "Should have 1 part");
  assert.equal(result[0].name, "quoted");
  assert.equal(
    result[0]._,
    "This is a long line that should be joined.\nThis line has special characters: = equals,   space"
  );
});

test("parse message with deeply nested structure", (t) => {
  const input = `--level1
Content-Disposition: post
Name: level1
Boundary: level2

Level 1 content

--level2
Content-Disposition: post
Name: level2
Boundary: level3

Level 2 content

--level3
Content-Disposition: post
Name: level3

Level 3 content
--level3--
--level2--
--level1--`;

  const result = parse(input);

  assert.equal(result.length, 1, "Should have 1 top-level part");
  assert.equal(result[0].name, "level1");
  assert.equal(result[0]._, "Level 1 content");
  assert.equal(result[0].nested.length, 1, "Should have 1 nested part");
  assert.equal(result[0].nested[0].name, "level2");
  assert.equal(result[0].nested[0]._, "Level 2 content");
  assert.equal(
    result[0].nested[0].nested.length,
    1,
    "Should have 1 deeply nested part"
  );
  assert.equal(result[0].nested[0].nested[0].name, "level3");
  assert.equal(result[0].nested[0].nested[0]._, "Level 3 content");
});

test("parse message with malformed headers", (t) => {
  const input = `--malformed
Content-Disposition: post
Name: good

Good content
--malformed
Malformed-Header
Name: bad

Bad content
--malformed--`;

  const result = parse(input);

  assert.equal(result.length, 1, "Should have 1 part");
  assert.equal(result[0].name, "good");
  assert.equal(result[0]._, "Good content");
});

test("parse empty message", (t) => {
  const input = `--empty
--empty--`;

  const result = parse(input);

  assert.equal(result.length, 0, "Should have no parts");
});

test("parse message with non-ASCII characters", (t) => {
  const input = `--unicode
Content-Disposition: post
Name: unicode
Content-Type: text/plain; charset=utf-8

こんにちは世界
--unicode--`;

  const result = parse(input);

  assert.equal(result.length, 1, "Should have 1 part");
  assert.equal(result[0].name, "unicode");
  assert.equal(result[0]._, "こんにちは世界");
});
////////////////
// ## Test:stringify
////////////////
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
////////////////
// ## Test: both
////////////////

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
