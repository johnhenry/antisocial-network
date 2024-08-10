# Multipart Message Format Primer

## Overview

The multipart message format is a way to encapsulate multiple parts of content within a single message. This format is commonly used for email attachments, form data submissions, and other scenarios where mixed content types need to be transmitted together.

## Basic Structure

A multipart message consists of:

1. A boundary string
2. Multiple parts, each separated by the boundary

### Boundary

- The message starts with a boundary string prefixed with two hyphens (--).
- The same boundary string is used to separate each part.
- The last boundary is followed by two additional hyphens to indicate the end of the message.

### Parts

Each part of a multipart message contains:

1. Headers
2. A blank line
3. Content

## Headers

- Headers provide metadata about each part.
- Each header is on a separate line in the format: `Key: Value`
- Common headers include:
  - Content-Disposition: Indicates if the part is inline content or an attachment
  - Name: The name of the part
  - Content-Type: The MIME type of the content
  - Content-Transfer-Encoding: The encoding used for the content (e.g., quoted-printable)

## Content

- The content follows the headers, separated by a blank line.
- Content can be text, binary data, or even nested multipart messages.

## Nested Structures

- A part can itself be a multipart message, allowing for nested structures.
- Nested parts use their own boundary, different from the parent message.

## Example

```
--boundary123
Content-Disposition: post
Name: text_part
Content-Type: text/plain

This is the text content.
--boundary123
Content-Disposition: file
Name: image.jpg
Content-Type: image/jpeg

[Binary data for the image]
--boundary123--
```

## Special Considerations

1. Boundaries are assumed to be cryptographically secure and won't appear in the content.
2. Line endings can be either \r\n or \n.
3. Non-ASCII characters are supported (assumed UTF-8 encoding).
4. Quoted-printable encoding is used for certain content types.
5. Empty parts (with no content) are allowed.

## Parsing Notes

- The parser should be strict about header formatting.
- Malformed headers should cause the parser to skip that part.
- The parser should handle nested structures recursively.
- Content length should be calculated in bytes.

This primer provides a basic understanding of the multipart message format as implemented in our parser. It covers the structure, key components, and special considerations for working with this format.
