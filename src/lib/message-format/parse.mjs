import { debug } from "node:console";

export function parse(input) {
  debug("Starting to parse input");
  const boundary = extractBoundary(input);
  debug(`Main boundary: ${boundary}`);
  return parseMultipart(input, boundary);
}

function extractBoundary(input) {
  const firstLine = input.split(/\r?\n/, 1)[0];
  return firstLine.startsWith("--") ? firstLine.slice(2) : null;
}

function parseMultipart(content, boundary) {
  debug(`Parsing multipart with boundary: ${boundary}`);
  const parts = content.split(new RegExp(`--${boundary}(?:--)?`, "m"));
  return parts
    .slice(1, -1)
    .map((part) => parsePart(part.trim()))
    .filter(Boolean);
}

function parsePart(part) {
  const [headerString, ...contentParts] = part.split(/\r?\n\r?\n/);
  const headers = parseHeaders(headerString);
  if (!headers) return null; // Invalid headers, skip this part

  let content = contentParts.join("\n\n").trim();

  if (!headers["Content-Disposition"]) return null;

  const result = {
    name: headers.Name,
    source: headers.Source,
    type: headers["Content-Type"],
    length: calculateLength(content),
    _: content,
    attachments: [],
  };

  if (headers.Boundary) {
    const nestedParts = parseMultipart(content, headers.Boundary);
    const firstBoundaryIndex = content.indexOf(`--${headers.Boundary}`);
    if (firstBoundaryIndex > 0) {
      result._ = content.slice(0, firstBoundaryIndex).trim();
      result.length = calculateLength(result._);
    } else {
      result._ = "";
    }
    result.nested = nestedParts;
  } else if (headers["Content-Disposition"] === "file") {
    result.attachments.push({
      name: headers.Name,
      type: headers["Content-Type"],
      length: calculateLength(content),
      _: content,
    });
    result._ = "";
  } else if (headers["Content-Transfer-Encoding"] === "quoted-printable") {
    result._ = decodeQuotedPrintable(content);
    result.length = calculateLength(result._);
  }

  debug(`Parsed part: ${JSON.stringify(result, null, 2)}`);
  return result;
}

function parseHeaders(headerString) {
  const headers = {};
  const lines = headerString.split(/\r?\n/);
  for (const line of lines) {
    const [key, ...valueParts] = line.split(":");
    if (!key || valueParts.length === 0) {
      debug(`Invalid header line: ${line}`);
      return null; // Invalid header, return null
    }
    headers[key.trim()] = valueParts.join(":").trim();
  }
  debug(`Parsed headers: ${JSON.stringify(headers)}`);
  return headers;
}

function calculateLength(content) {
  return Buffer.from(content).length;
}

function decodeQuotedPrintable(input) {
  return input
    .replace(/=\r?\n/g, "")
    .replace(/=([0-9A-F]{2})/g, (_, p1) =>
      String.fromCharCode(parseInt(p1, 16))
    );
}
