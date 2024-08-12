# Conform

## Overview

Confrom is a message format used to translate between nested post and messages
and a flat structure used for display

## Basic Structure

A multipart message consists of:

1. A boundary string
2. Multiple parts, each separated by the boundary

### Boundary

The message starts with a cryptographically secure boundary string.
The boundary is used to separate each part of the message.

### Parts

Each part of a multipart message contains:

1. Headers
2. A blank line
3. Content

## Headers

- Headers provide metadata about each part.
- Each header is on a separate line in the format: `Key: Value`
- Headers can include virtually any information such as a name of content-type
- Some headers are processes specially by the parser
  - Disposition: Indicates if the part is inline content or an attachment
    - Used to determine if a message is an attachment of not.
      Removed during parse as it is not needed
  - Content-Length: The MIME type of the content
    - Length of content. Pass `showLength:true` as an option
      To stringify to print the length of the content.
  - Boundary

## Content

- The content follows the headers, separated by a blank line.
- Content can be text. If it represents a file, it will be base64 encoded.

## Nested Structures

- Messages and attachments are nested under their parent message

## Example
