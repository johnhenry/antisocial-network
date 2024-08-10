import { test } from "node:test";
import assert from "node:assert/strict";
import { parse } from "./parse.mjs";

const testInput = `Content-Length: 1075
Content-Type: multipart/mixed
Boundary: AaB03x

--AaB03x
Content-Disposition: post
Name: mr-monroe
Source: agent:12345
Content-Length: 16
Content-Type: text/plain
Boundary: CcD05z

Hello students.

--CcD05z
Content-Disposition: post
Name: becky
Source: agent:23456
Content-Length: 13

Hello Teacher
--CcD05z
Content-Disposition: post
Name: tanya
Source: agent:34567
Content-Length: 25
Boundary: BbC04y

Good morning! Mr. Monroe!

--BbC04y
Content-Disposition: post
Name: becky
Source: agent:23456
Content-Length: 42

He's never going to notice you agent:34567
--BbC04y--
--CcD05z--
--AaB03x
Content-Disposition: post
Name: mr-monroe
Source: agent:12345
Content-Length: 43
Boundary: DdE06w

Today we have a special image to show you.

--DdE06w
Content-Disposition: file
Name: fancy.jpg
Content-Type: image/jpeg
Content-Transfer-Encoding: base64
Content-Length: 28

ABDZJRU5ErkJproject_plan_pdf==
--DdE06w
Content-Disposition: post
Name: tanya
Source: agent:34567
Content-Length: 28

That's beautiful Mr. Monroe!
--DdE06w--
--AaB03x
Content-Disposition: post
Name: mr-monroe
Source: agent:12345
Content-Length: 35

I hope you all had a good vacation.
--AaB03x--`;

test("parse nested multipart message", (t) => {
  const result = parse(testInput);

  assert.equal(result.length, 3, "Should have 3 top-level parts");

  // First part
  assert.equal(result[0].name, "mr-monroe");
  assert.equal(result[0].source, "agent:12345");
  assert.equal(result[0].type, "text/plain");
  assert.equal(result[0]._.length, 2, "Should have 2 nested parts");
  assert.equal(result[0]._[0]._, "Hello students.");

  // Nested parts in first part
  assert.equal(result[0]._[1].length, 2, "Should have 2 nested parts");
  assert.equal(result[0]._[1][0].name, "becky");
  assert.equal(result[0]._[1][0].source, "agent:23456");
  assert.equal(result[0]._[1][0]._, "Hello Teacher");

  assert.equal(result[0]._[1][1].name, "tanya");
  assert.equal(result[0]._[1][1].source, "agent:34567");
  assert.equal(result[0]._[1][1]._, "Good morning! Mr. Monroe!");

  // Second part
  assert.equal(result[1].name, "mr-monroe");
  assert.equal(result[1].source, "agent:12345");
  assert.equal(result[1]._.length, 2, "Should have 2 nested parts");
  assert.equal(result[1]._[0]._, "Today we have a special image to show you.");

  // File attachment
  assert.equal(result[1]._[0].attachments.length, 1);
  assert.equal(result[1]._[0].attachments[0].name, "fancy.jpg");
  assert.equal(result[1]._[0].attachments[0].type, "image/jpeg");
  assert.equal(
    result[1]._[0].attachments[0]._,
    "ABDZJRU5ErkJproject_plan_pdf=="
  );

  // Third part
  assert.equal(result[2].name, "mr-monroe");
  assert.equal(result[2].source, "agent:12345");
  assert.equal(result[2]._, "I hope you all had a good vacation.");
});

test("parse simple message", (t) => {
  const simpleInput = `Content-Length: 100
Content-Type: multipart/mixed
Boundary: simple

--simple
Content-Disposition: post
Name: test
Source: agent:12345
Content-Length: 11
Content-Type: text/plain

Hello World
--simple--`;

  const result = parse(simpleInput);

  assert.equal(result.length, 1, "Should have 1 part");
  assert.equal(result[0].name, "test");
  assert.equal(result[0].source, "agent:12345");
  assert.equal(result[0].length, 11);
  assert.equal(result[0].type, "text/plain");
  assert.equal(result[0]._, "Hello World");
  assert.equal(result[0].attachments.length, 0);
});

test("parse message with file attachment", (t) => {
  const inputWithFile = `Content-Length: 300
Content-Type: multipart/mixed
Boundary: main

--main
Content-Disposition: post
Name: withfile
Source: agent:12345
Content-Length: 20
Boundary: file

Message with file

--file
Content-Disposition: file
Name: test.txt
Content-Type: text/plain
Content-Transfer-Encoding: base64
Content-Length: 16

SGVsbG8gZnJvbSBmaWxl
--file--
--main--`;

  const result = parse(inputWithFile);

  assert.equal(result.length, 1, "Should have 1 part");
  assert.equal(result[0].name, "withfile");
  assert.equal(result[0].source, "agent:12345");
  assert.equal(result[0]._.length, 1, "Should have 1 nested part");
  assert.equal(result[0]._[0]._, "Message with file");
  assert.equal(
    result[0]._[0].attachments.length,
    1,
    "Should have 1 attachment"
  );
  assert.equal(result[0]._[0].attachments[0].name, "test.txt");
  assert.equal(result[0]._[0].attachments[0].type, "text/plain");
  assert.equal(result[0]._[0].attachments[0]._, "SGVsbG8gZnJvbSBmaWxl");
});
