import { debug } from "node:console";

export function parse(input) {
  debug("Starting to parse input");
  const lines = input.split("\n");
  const headers = parseHeaders(lines);
  const mainBoundary = headers.Boundary;

  debug(`Main boundary: ${mainBoundary}`);

  const parts = splitParts(lines.slice(headers.headerLines), mainBoundary);
  debug(`Found ${parts.length} main parts`);
  return parseParts(parts, mainBoundary);
}

function parseHeaders(lines) {
  const headers = {};
  let i = 0;
  for (; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === "") break;
    const [key, ...valueParts] = line.split(":");
    headers[key.trim()] = valueParts.join(":").trim();
  }
  headers.headerLines = i + 1;
  debug(`Parsed headers: ${JSON.stringify(headers)}`);
  return headers;
}

function splitParts(lines, boundary) {
  const parts = [];
  let currentPart = [];
  for (const line of lines) {
    if (line.trim() === `--${boundary}`) {
      if (currentPart.length > 0) {
        parts.push(currentPart);
        currentPart = [];
      }
    } else if (line.trim() === `--${boundary}--`) {
      if (currentPart.length > 0) {
        parts.push(currentPart);
      }
      break;
    } else {
      currentPart.push(line);
    }
  }
  debug(`Split into ${parts.length} parts`);
  return parts;
}

function parseParts(parts, parentBoundary) {
  debug(`Parsing ${parts.length} parts with boundary ${parentBoundary}`);
  return parts
    .map((part, index) => {
      debug(`Parsing part ${index + 1}`);
      const headers = parseHeaders(part);
      const content = part.slice(headers.headerLines);
      const result = {
        name: headers.Name,
        source: headers.Source,
        length: calculateLength(content),
        type: headers["Content-Type"],
        _: "",
        attachments: [],
      };

      if (headers.Boundary) {
        debug(`Found nested boundary: ${headers.Boundary}`);
        const nestedParts = splitParts(content, headers.Boundary);
        const parsedNestedParts = parseParts(nestedParts, headers.Boundary);

        // Merge content before first boundary with the first nested part
        if (parsedNestedParts.length > 0) {
          const firstPartContent = content
            .slice(
              0,
              content.findIndex(
                (line) => line.trim() === `--${headers.Boundary}`
              )
            )
            .join("\n")
            .trim();
          if (firstPartContent) {
            result._ = firstPartContent;
          }
          result._ = [
            result,
            ...parsedNestedParts.filter((part) => Object.keys(part).length > 0),
          ];
        } else {
          result._ = content.join("\n").trim();
        }
      } else if (headers["Content-Disposition"] === "file") {
        debug("Found file attachment");
        result.attachments.push({
          name: headers.Name,
          type: headers["Content-Type"],
          length: calculateLength(content),
          _: content.join("\n").trim(),
        });
      } else {
        result._ = content.join("\n").trim();
      }

      debug(`Parsed result: ${JSON.stringify(result)}`);

      // Remove empty or invalid parts
      if (
        Object.keys(result).length === 0 ||
        (result._ === "" && result.attachments.length === 0)
      ) {
        return null;
      }

      return result;
    })
    .filter(Boolean); // Remove null entries
}

function calculateLength(content) {
  return Buffer.from(content.join("\n")).length;
}
