# Primer: Interpreting the Message Format String

This primer explains how to interpret the string representation of nested messages, including their headers, content, attachments, and responses.

## 1. Overall Structure

The string represents a series of messages, which may contain nested responses and attachments. Each message is separated by a boundary marker.

## 2. Boundary Markers

- Boundaries are used to separate different parts of the message structure.
- They are defined in the headers and used throughout the message.
- Format: `--{boundary_value}`
- The last boundary for a section ends with `--`, like this: `--{boundary_value}--`

## 3. Message Components

Each message consists of:

a) Headers
b) Content
c) Attachments (optional)
d) Responses (optional)

### 3.1 Headers

- Headers appear at the beginning of each message or attachment.
- Each header is on a separate line.
- Format: `Header-Name: Header-Value`
- Common headers include:
  - Content-Disposition: Indicates if it's a 'post' or 'file'
  - Name: Name of the sender or file
  - Source: Source of the message (e.g., user ID)
  - Content-Type: Type of content (e.g., text/plain, application/pdf)
  - Content-Transfer-Encoding: Encoding method (e.g., base64 for attachments)
  - Boundary: Defines the boundary for nested parts (if applicable)

### 3.2 Content

- The content follows the headers, separated by a blank line.
- For text messages, it's plain text.
- For attachments, it may be base64 encoded data.

### 3.3 Attachments

- Attachments are treated as nested parts within a message.
- They have their own headers and content.
- The content is typically base64 encoded.

### 3.4 Responses

- Responses are nested messages within a parent message.
- They follow the same structure as top-level messages.
- They are separated by the boundary defined in the parent message's headers.

## 4. Parsing Strategy

To parse this string format:

1. Split the string by the top-level boundary.
2. For each resulting part:
   a) Separate headers from the body (split by first blank line).
   b) Parse headers into key-value pairs.
   c) If there's a 'Boundary' header, use it to split the body into sub-parts.
   d) Recursively parse each sub-part as a nested message or attachment.
   e) The content is the part of the body before any sub-parts.

## 5. Example Interpretation

```
Content-Type: multipart/mixed
Boundary: ABC123

--ABC123
Content-Disposition: post
Name: Alice
Content-Type: text/plain

Hello, this is a message.

--ABC123
Content-Disposition: file
Name: document.pdf
Content-Type: application/pdf
Content-Transfer-Encoding: base64

JVBERi0xLjMKJcTl8uXrp/Og0MTGCjQgMCBvYmo...

--ABC123
Content-Disposition: post
Name: Bob
Boundary: XYZ789

This is a response with a nested message.

--XYZ789
Content-Disposition: post
Name: Charlie

This is a nested response.
--XYZ789--

--ABC123--
```

Interpretation:

- There are three top-level parts separated by `--ABC123`.
- The first part is a text message from Alice.
- The second part is a PDF attachment.
- The third part is a response from Bob, which contains a nested response from Charlie.

By following this primer, an LLM should be able to accurately interpret and process the given message format string, understanding its structure, boundaries, and nested components.
