// index.mjs
import { debug } from "node:console";
import crypto from "node:crypto";

//////////////////
// ## stringify
//////////////////
const calculateLength = (content) => {
  return Buffer.from(content).length;
};
const decodeQuotedPrintable = (input) => {
  return input
    .replace(/=\r?\n/g, "")
    .replace(/=([0-9A-F]{2})/g, (_, p1) =>
      String.fromCharCode(parseInt(p1, 16))
    );
};
const extractBoundary = (input) => {
  const firstLine = input.split(/\r?\n/, 1)[0];
  return firstLine.startsWith("--") ? firstLine.slice(2) : null;
};
const parseMultipart = (content, boundary) => {
  debug(`Parsing multipart with boundary: ${boundary}`);
  const parts = content.split(new RegExp(`--${boundary}(?:--)?`, "m"));
  return parts
    .slice(1, -1)
    .map((part) => parsePart(part.trim()))
    .filter(Boolean);
};
const parsePart = (part) => {
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
};

const parseHeaders = (headerString) => {
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
};

/**
 * Parses the input message format.
 *
 * @param {string} input - The input message to parse.
 * @returns {object} - The parsed message format.
 */
export const parse = (input) => {
  debug("Starting to parse input");
  const boundary = extractBoundary(input);
  debug(`Main boundary: ${boundary}`);
  return parseMultipart(input, boundary);
};

//////////////////
// ## stringify
//////////////////
/**
 * Converts an array of parts into a formatted string representation.
 *
 * @param {Array} obj - The array of parts to be converted.
 * @param {Object} [options] - The optional configuration options.
 * @param {boolean} [options.showBoundaries=true] - Whether to show boundaries in the output.
 * @param {number|string} [options.replyIndent] - The indentation for reply content.
 * @param {string} [options.lineEnding="\n"] - The line ending character(s) to use.
 * @returns {string} The formatted string representation of the parts.
 * @throws {Error} If the input is not an array of parts.
 */
export const stringify = (obj, options = {}) => {
  const defaultOptions = {
    showBoundaries: true,
    replyIndent: undefined,
    lineEnding: "\n",
  };
  const opts = { ...defaultOptions, ...options };

  const generateBoundary = () => {
    return crypto.randomBytes(16).toString("hex");
  };

  const stringifyPart = (part, indent = "") => {
    const boundary = generateBoundary();
    let result = "";

    if (opts.showBoundaries) {
      result += `${indent}--${boundary}${opts.lineEnding}`;
    }

    // Add headers
    result += `${indent}Content-Disposition: ${
      part.contentDisposition || "post"
    }${opts.lineEnding}`;
    result += `${indent}Name: ${part.name}${opts.lineEnding}`;
    if (part.source)
      result += `${indent}Source: ${part.source}${opts.lineEnding}`;
    if (part.type)
      result += `${indent}Content-Type: ${part.type}${opts.lineEnding}`;

    if (part.attachments && part.attachments.length > 0) {
      result += `${indent}Boundary: ${boundary}${opts.lineEnding}`;
    }

    result += opts.lineEnding; // Empty line after headers

    // Add content
    if (part._) {
      const contentLines = part._.split(/\r?\n/);
      const indentStr =
        typeof opts.replyIndent === "number"
          ? " ".repeat(opts.replyIndent)
          : opts.replyIndent || "";
      const indentedContent = contentLines
        .map((line, index) => `${indent}${index === 0 ? "" : indentStr}${line}`)
        .join(opts.lineEnding);
      result += indentedContent + opts.lineEnding;
    }

    // Add attachments
    if (part.attachments && part.attachments.length > 0) {
      const newIndent = opts.replyIndent
        ? indent +
          (typeof opts.replyIndent === "number"
            ? " ".repeat(opts.replyIndent)
            : opts.replyIndent)
        : indent;
      part.attachments.forEach((attachment) => {
        result += stringifyPart(
          {
            contentDisposition: "file",
            name: attachment.name,
            type: attachment.type,
            _: attachment._,
          },
          newIndent
        );
      });
      if (opts.showBoundaries) {
        result += `${indent}--${boundary}--${opts.lineEnding}`;
      }
    }

    return result;
  };

  if (!Array.isArray(obj)) {
    throw new Error("Input must be an array of parts");
  }

  const mainBoundary = generateBoundary();
  let result = "";

  obj.forEach((part, index) => {
    result += stringifyPart(part, "");
  });

  if (opts.showBoundaries) {
    result += `--${mainBoundary}--${opts.lineEnding}`;
  }

  return result;
};
