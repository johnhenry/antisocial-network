import { test } from "node:test";
import assert from "node:assert/strict";
import { parse } from "./parse.mjs";

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
