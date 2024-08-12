import crypto from "node:crypto";

const splitOnBoundary = (string, boundary = undefined) => {
  if (!boundary) {
    boundary = string.slice(0, string.indexOf("\n"));
  }
  const splits = string.split(boundary);
  splits.pop();
  return splits.map((s) => s.trim());
};

const parseHeaders = (headerString) => {
  const headers = {};
  const lines = headerString.split("\n");
  for (const line of lines) {
    const [key, ...valueParts] = line.split(":");
    if (!key || valueParts.length === 0) {
      continue;
    }
    headers[key.trim()] = valueParts.join(":").trim();
  }
  return headers;
};

const mapParts = (input) => {
  const parts = input.split("\n\n");
  const p = parts.shift();
  const headers = parseHeaders(p);
  const body = parts.join("\n\n");
  if (!headers.Boundary) {
    delete headers.Boundary;
    return [{ ...headers, ...(body ? { _: body } : {}) }];
  }
  const [_, ...rest] = splitOnBoundary(body, headers.Boundary);

  const replies = [];
  const attachments = [];
  for (const [p, ...more] of rest.filter((x) => x.trim()).map(mapParts)) {
    if (p.Disposition === "attachment") {
      delete p.Disposition;
      attachments.push(p);
    } else {
      replies.push(p, ...more);
    }
  }
  delete headers.Boundary;
  return [
    {
      ...headers,
      ...(_ ? { _ } : {}),
      ...(attachments.length ? { attachments } : {}),
    },
    ...(replies.length ? [replies] : []),
  ];
};
export const parse = (input) => {
  const [_, ...parts] = splitOnBoundary(input);
  return parts.map(mapParts);
};
//////////
//
//////////
const generateBoundary = () => {
  return crypto.randomBytes(16).toString("hex");
};

export const stringify = (
  parts,
  {
    level = 0,
    indentation = "",
    showLength = false,
    boundary = generateBoundary(),
    showBoundry = true,
    showHeaders = true,
    showAttachments = true,
    indentBoundary = true,
  } = {}
) => {
  const output = [];
  const indent =
    typeof indentation === "number"
      ? " ".repeat(indentation * level)
      : typeof indentation === "string"
      ? indentation.repeat(level)
      : "";
  for (const part of parts) {
    if (showBoundry) {
      if (showBoundry === true) {
        output.push(`${indentBoundary ? indent : ""}${boundary}`);
      } else {
        output.push(`${indentBoundary ? indent : ""}${showBoundry}`);
      }
    }
    const [post, ...replies] = part;
    const hasChildren =
      (post.attachments && post.attachments.length) || replies.length > 0;
    if (showHeaders) {
      const bool = !Array.isArray(showHeaders);
      for (const [key, value] of Object.entries(post)) {
        if (
          key === "_" ||
          key === "attachments" ||
          key === "Content-Length" ||
          (!bool && !showHeaders.includes(key))
        ) {
          continue;
        }
        output.push(`${indent}${key}: ${value}`);
      }
    }
    if (showLength && post._) {
      output.push(`${indent}Content-Length: ${post._.length}`);
    }
    let newBoundary;
    if (hasChildren) {
      if (showBoundry) {
        newBoundary = generateBoundary();
        output.push(`${indent}Boundary: ${newBoundary}`);
      }
    }
    output.push("");
    let { _ } = post;
    if (typeof indentation !== "undefined") {
      if (indent && _) {
        _ = _.split("\n")
          .map((line) => indent + line)
          .join("\n");
      }
    }

    output.push(_);
    if (hasChildren) {
      const attachments =
        (showAttachments &&
          post.attachments &&
          post.attachments.map((x) => [
            {
              Disposition: "attachment",
              ...x,
            },
          ])) ||
        [];
      output.push(
        stringify([...attachments, ...replies], {
          level: level + 1,
          indentation,
          boundary: newBoundary,
          showBoundry,
          showHeaders,
          showLength,
          showAttachments,
          indentBoundary,
        })
      );
    }
  }
  if (showBoundry) {
    if (showBoundry === true) {
      output.push(`${indentBoundary ? indent : ""}${boundary}`);
    } else {
      output.push(`${indentBoundary ? indent : ""}${showBoundry}`);
    }
  }
  return output.join("\n");
};
