// parse.mjs

export function parse(input) {
  const topLevelBoundary = extractTopLevelBoundary(input);
  return parseWithBoundary(input, topLevelBoundary);
}

function extractTopLevelBoundary(input) {
  const match = input.match(
    /^Content-Type: multipart\/mixed\s+Boundary:(\S+)/m
  );
  return match ? match[1] : null;
}

function parseWithBoundary(input, boundary) {
  const parts = input.split(`--${boundary}`).slice(1, -1);
  return parts.map((part) => parseSingleMessage(part.trim(), boundary));
}

function parseSingleMessage(messagePart, parentBoundary) {
  const [headersPart, ...contentParts] = messagePart.split("\n\n");
  const headers = parseHeaders(headersPart);
  let content = contentParts.join("\n\n").trim();

  const message = {
    headers,
    content: "",
    attachments: [],
    responses: [],
  };

  if (headers.Boundary) {
    const subParts = parseWithBoundary(content, headers.Boundary);
    subParts.forEach((subPart) => {
      if (subPart.headers.Disposition === "file") {
        message.attachments.push(subPart);
      } else {
        message.responses.push(subPart);
      }
    });
    const contentEndIndex = content.indexOf(`--${headers.Boundary}`);
    message.content = content.slice(0, contentEndIndex).trim();
  } else {
    const contentEndIndex = content.lastIndexOf(`--${parentBoundary}`);
    message.content =
      contentEndIndex !== -1
        ? content.slice(0, contentEndIndex).trim()
        : content.trim();
  }

  return message;
}

function parseHeaders(headersPart) {
  const headers = {};
  headersPart.split("\n").forEach((line) => {
    const [key, ...valueParts] = line.split(":").map((part) => part.trim());
    if (key && valueParts.length > 0) {
      headers[key] = valueParts.join(":").trim().replace(/;$/, "");
    }
  });
  return headers;
}
