// parse.test.mjs

import { strict as assert } from "node:assert";
import { test } from "node:test";
import { parse } from "./parse.mjs";

const testInput = `content-Length: <calculated based on content>
content-Type: multipart/mixed
Boundary:AaB03x

--AaB03x
content-disposition: post
name:mr-monroe
source: agent:12345
content-length: <calculated based on content>
content-Type: text/plain

Hello Students.
--AaB03x
content-disposition: post
name:becky
source: agent:23456
content-length: <calculated based on content>

Hello Teacher
--AaB03x
content-disposition: post
name:tanya
source: agent:34567
content-length: <calculated based on content>
Boundary: CcD05z

Good morning! Mr. Monroe!
--CcD05z
disposition: post
name:becky
source: agent:23456
content-length: <calculated based on content>

He's never going to notice you agent:34567
--CcD05z--
--AaB03x
source: agent:12345
name: mr-monroe
content-length: <calculated based on content>
disposition: post
Boundary: BbC04y

Today we have a special image to show you.
--BbC04y
content-length: <calculated based on content>
disposition: file
name: fancy.jpg
content-Type: image/jpeg
content-Transfer-Encoding: base64

ABDZJRU5ErkJproject_plan_pdf==
--BbC04y
content-disposition: post
name:tanya
source: agent:34567
content-length: <calculated based on content>

That's beautiful Mr. Monroe!
--BbC04y--
--AaB03x
disposition: post
name:mr-monroe
source: agent:12345
content-length: <calculated based on content>

I hope you all had a good vacation.
--AaB03x--`;

[
  [
    {
      name: "mr-monroe",
      source: "agent:12345",
      "content-length": "<calculated based on content>",
      "content-Type": "text/plain",
      _: "Hello Students.",
    },
    [
      [
        {
          name: "becky",
          source: "agent:23456",
          "content-length": "<calculated based on content>",
          _: "Hello Teacher",
        },
      ],
      [
        {
          name: "tanya",
          source: "agent:34567",
          "content-length": "<calculated based on content>",
          _: "Good morning! Mr. Monroe!",
        },
        [
          {
            name: "becky",
            source: "agent:23456",
            "content-length": "<calculated based on content>",
            _: "He's never going to notice you agent:34567",
          },
        ],
      ],
    ],
  ],
  [
    {
      name: "mr-monroe",
      source: "agent:12345",
      "content-length": "<calculated based on content>",
      _: "Today we have a special image to show you",
      attachments: [
        {
          name: "fancy.jpg",
          type: "image/jpeg",
          "content-length": "<calculated based on content>",
          "content-type": "image/jpeg",
          _: "Hello Teacher",
        },
      ],
    },
  ],
  [
    {
      name: "mr-monroe",
      source: "agent:12345",
      _: "I hope you all had a good vacation.",
    },
  ],
];

test("parse function", async (t) => {
  await t.test("should parse top-level messages correctly", () => {
    const result = parse(testInput);
    assert.equal(result.length, 5, "Should have 5 top-level messages");
  });

  await t.test("should parse nested messages correctly", () => {
    const result = parse(testInput);
    assert.equal(
      result[2].responses.length,
      1,
      "Third message should have 1 response"
    );
    assert.equal(
      result[3].responses.length,
      1,
      "Fourth message should have 1 response"
    );
  });

  await t.test("should parse attachments correctly", () => {
    const result = parse(testInput);
    assert.equal(
      result[3].attachments.length,
      1,
      "Fourth message should have 1 attachment"
    );
    assert.equal(
      result[3].attachments[0].headers.name,
      "fancy.jpg",
      "Attachment should be named fancy.jpg"
    );
  });

  await t.test("should parse headers correctly", () => {
    const result = parse(testInput);
    assert.equal(
      result[0].headers["name"],
      "mr-monroe",
      "First message should have correct name header"
    );
    assert.equal(
      result[0].headers["source"],
      "agent:12345",
      "First message should have correct source header"
    );
  });

  await t.test("should parse content correctly", () => {
    const result = parse(testInput);
    assert.equal(
      result[0].content.trim(),
      "Hello Students.",
      "First message should have correct content"
    );
    assert.equal(
      result[4].content.trim(),
      "I hope you all had a good vacation.",
      "Fifth message should have correct content"
    );
  });
});
