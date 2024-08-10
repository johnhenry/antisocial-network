import crypto from "node:crypto";

export function stringify(obj, options = {}) {
  const defaultOptions = {
    showBoundaries: true,
    replyIndent: undefined,
    lineEnding: "\n",
  };
  const opts = { ...defaultOptions, ...options };

  function generateBoundary() {
    return crypto.randomBytes(16).toString("hex");
  }

  function stringifyPart(part, indent = "") {
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
  }

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
}
