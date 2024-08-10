// stringify.test.mjs
import { strict as assert } from "node:assert";
import { test } from "node:test";
import { stringify } from "./stringify.mjs";

const testMessages = [
  {
    headers: {
      "Content-Disposition": "post",
      Name: "mr-monroe",
      Source: "agent:12345",
      "Content-length": "xxx",
      "Content-Type": "text/plain",
    },
    content: "Hello Students.",
    responses: [
      {
        headers: {
          "Content-Disposition": "post",
          Name: "becky",
          Source: "agent:23456",
          "Content-length": "xxx",
        },
        content: "Hello Teacher",
      },
      {
        headers: {
          "Content-Disposition": "post",
          Source: "agent:34567",
          "Content-length": "xxx",
          Boundary: "CcD05z",
        },
        content: "Good morning! Mr. Monroe!",
        responses: [
          {
            headers: {
              Disposition: "post",
              Name: "becky",
              Source: "agent:23456",
              "Content-length": "xxx",
            },
            content: "He's never going to notice you agent:34567",
          },
        ],
      },
    ],
  },
  {
    headers: {
      Source: "agent:12345",
      Name: "mr-monroe",
      "Content-length": "xxx",
      Disposition: "post",
      Boundary: "BbC04y",
    },
    content: "Today we have a special image to show you.",
    attachments: [
      {
        headers: {
          "Content-length": "xxx",
          Disposition: "file",
          Name: "fancy.jpg",
          "Content-Type": "image/jpeg",
          "Content-Transfer-Encoding": "base64",
        },
        content: "base64encodedcontent",
      },
    ],
    responses: [
      {
        headers: {
          "Content-Disposition": "post",
          Name: "tanya",
          Source: "agent:34567",
          "Content-length": "xxx",
        },
        content: "That's beautiful Mr. Monroe!",
      },
    ],
  },
  {
    headers: {
      Disposition: "post",
      Name: "mr-monroe",
      Source: "agent:12345",
      "Content-length": "xxx",
    },
    content: "I hope you all had a good vacation.",
  },
];
test("stringify function", async (t) => {
  await t.test("should stringify messages with default options", () => {
    const result = stringify(testMessages);
    assert.ok(
      result.includes("Hello Students."),
      "Should include first message content"
    );
    assert.ok(
      result.includes("Hello Teacher"),
      "Should include nested response"
    );
    assert.ok(
      result.includes("YmFzZTY0ZW5jb2RlZGNvbnRlbnQ="),
      "Should include base64 encoded attachment content"
    );
    assert.ok(
      result.includes("I hope you all had a good vacation."),
      "Should include last message content"
    );
    assert.ok(result.includes("--"), "Should include boundaries");
  });

  await t.test("should stringify messages with indent option", () => {
    const result = stringify(testMessages, { indent: 2 });
    assert.ok(
      result.includes("  Hello Teacher"),
      "Should indent nested response"
    );
    assert.ok(
      result.includes("    He's never going to notice you agent:34567"),
      "Should indent deeply nested response"
    );
  });

  await t.test("should stringify messages without boundaries", () => {
    const result = stringify(testMessages, { showBoundary: false });
    assert.ok(!result.includes("--"), "Should not include boundaries");
  });

  await t.test("should calculate correct content length", () => {
    const result = stringify(testMessages);
    assert.ok(
      result.includes("Content-length: 15"),
      'Should calculate correct content length for "Hello Students."'
    );
  });

  await t.test("should include attachment content", () => {
    const result = stringify(testMessages);
    assert.ok(
      result.includes("YmFzZTY0ZW5jb2RlZGNvbnRlbnQ="),
      "Should include base64 encoded attachment content"
    );
    assert.ok(
      result.includes("Content-Transfer-Encoding: base64"),
      "Should include Content-Transfer-Encoding header for attachment"
    );
  });
});
