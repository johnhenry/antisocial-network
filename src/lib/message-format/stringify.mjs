// stringify.mjs
import crypto from "crypto";

const BASE58_ALPHABET =
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function generateBase58Boundary(length = 16) {
  const bytes = crypto.randomBytes(length);
  let boundary = "";
  for (let i = 0; i < length; i++) {
    boundary += BASE58_ALPHABET[bytes[i] % BASE58_ALPHABET.length];
  }
  return boundary;
}

function calculateContentLength(content) {
  return Buffer.from(content).length;
}

function stringifyHeaders(headers) {
  return Object.entries(headers)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");
}

function stringifyContent(content, indent) {
  return content
    .split("\n")
    .map((line) => " ".repeat(indent) + line)
    .join("\n");
}

function stringifyAttachment(attachment, options, indent) {
  const headers = stringifyHeaders(attachment.headers);
  const content = attachment.content
    ? Buffer.from(attachment.content).toString("base64")
    : "";
  return `${headers}\n\n${" ".repeat(indent)}${content}`;
}

export function stringify(messages, options = {}) {
  const { indent = 0, showBoundary = true } = options;

  function stringifyMessage(message, currentIndent = 0) {
    const boundary = generateBase58Boundary();
    let result = "";

    // Headers
    result += stringifyHeaders(message.headers) + "\n\n";

    // Content
    if (message.content) {
      const contentLength = calculateContentLength(message.content);
      result = result.replace(
        /^Content-length: xxx$/m,
        `Content-length: ${contentLength}`
      );
      result += stringifyContent(message.content, currentIndent) + "\n";
    }

    // Attachments
    if (message.attachments && message.attachments.length > 0) {
      message.attachments.forEach((attachment) => {
        if (showBoundary) result += `\n--${boundary}\n`;
        result +=
          stringifyAttachment(attachment, options, currentIndent) + "\n";
      });
    }

    // Responses
    if (message.responses && message.responses.length > 0) {
      message.responses.forEach((response) => {
        if (showBoundary) result += `\n--${boundary}\n`;
        result += stringifyMessage(response, currentIndent + indent);
      });
    }

    if (
      showBoundary &&
      (message.attachments?.length > 0 || message.responses?.length > 0)
    ) {
      result += `\n--${boundary}--\n`;
    }

    // console.log("Stringified message:", result); // Debug log
    return result;
  }

  const output = messages
    .map((message) => stringifyMessage(message))
    .join("\n");
  // console.log("Final output:", output); // Debug log
  return output;
}
