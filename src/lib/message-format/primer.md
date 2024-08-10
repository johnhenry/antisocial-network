# primer.md

# Multipart Message Format Primer

## Introduction

Multipart messages are a way to send multiple pieces of content in a single message. This format is similar to that used in email (MIME) and HTTP file uploads. See "rfc1867.relevant.md" for relevant parts of the specification.

## Basic Structure

A multipart message consists of:

1. Headers
2. A boundary declaration
3. Multiple parts, each separated by the boundary

### Headers

Headers provide metadata about the message. Common headers include:

- `Content-Type`: Specifies the type of content (e.g., `multipart/mixed`)
- `Content-Length`: The total length of the message
- `Boundary`: A unique string that separates different parts of the message

### Boundary

The boundary is a unique string that separates different parts of the message. It's declared in the `Content-Type` header and used throughout the message body.

### Parts

Each part of a multipart message can contain:

- Its own set of headers
- Content
- Nested multipart messages (in the case of complex structures)

## How It Works

1. **Message Start**: The message begins with headers, including the Content-Type that declares it's a multipart message and specifies the boundary.

2. **Part Separation**: Each part starts with a boundary line (`--boundary`).

3. **Part Structure**: Each part has its own headers followed by a blank line and then the content.

4. **Message End**: The last boundary line is followed by two hyphens (`--boundary--`).

## Example

```
Content-Type: multipart/mixed; boundary="XYZ"

--XYZ
Content-Type: text/plain

This is the first part.
--XYZ
Content-Type: text/html

<h1>This is the second part.</h1>
--XYZ--
```

## Parsing Process

1. Identify the main boundary from the headers.
2. Split the message body using the boundary.
3. For each part:
   a. Parse its headers
   b. Extract its content
   c. If it's a nested multipart message, repeat the process
4. Construct a structured representation of the message.

## Special Considerations

1. **Nested Structures**: Parts can themselves be multipart messages, leading to complex nested structures.

2. **Content-Disposition**: If Content-Deposition is "file", the part is an attachment; otherwise it's considered a post. Files will alway be base64 encoded.

3. **Whitespace**: Be cautious of leading/trailing whitespace in boundaries and content -- it counts as part of the message
