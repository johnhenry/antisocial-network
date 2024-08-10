// demo.mjs
import { parse } from "./parse.mjs";
import { stringify } from "./stringify.mjs";

const { log } = console;
// const log = () => {};
const logSection = (title) => {
  log("\n" + "=".repeat(32));
  log(title);
  log("=".repeat(32) + "\n");
};

// Sample nested messages structure
const sampleMessages = [
  {
    headers: {
      "Content-Disposition": "post",
      Name: "Alice",
      Source: "user:alice123",
      "Content-Type": "text/plain",
    },
    content: "Hello everyone! I have an announcement to make.",
    responses: [
      {
        headers: {
          "Content-Disposition": "post",
          Name: "Bob",
          Source: "user:bob456",
        },
        content: "Looking forward to hearing it, Alice!",
      },
      {
        headers: {
          "Content-Disposition": "post",
          Name: "Charlie",
          Source: "user:charlie789",
        },
        content: "Is it about the new project?",
        responses: [
          {
            headers: {
              "Content-Disposition": "post",
              Name: "Alice",
              Source: "user:alice123",
            },
            content: "You guessed it, Charlie! I'll share more details soon.",
          },
        ],
      },
    ],
  },
  {
    headers: {
      "Content-Disposition": "post",
      Name: "Alice",
      Source: "user:alice123",
    },
    content: "Here are the details of our new project!",
    attachments: [
      {
        headers: {
          "Content-Disposition": "file",
          Name: "project_plan.pdf",
          "Content-Type": "application/pdf",
          "Content-Transfer-Encoding": "base64",
        },
        content: "ABDZJRU5ErkJproject_plan_pdf==",
      },
      {
        headers: {
          "Content-Disposition": "file",
          Name: "team_photo.jpg",
          "Content-Type": "image/jpeg",
          "Content-Transfer-Encoding": "base64",
        },
        content: "ABDZJRU5ErkJteam_photo_jpg==",
      },
    ],
    responses: [
      {
        headers: {
          "Content-Disposition": "post",
          Name: "Bob",
          Source: "user:bob456",
        },
        content: "This looks great! I'm excited to get started.",
      },
    ],
  },
];

// Demo
async function runDemo() {
  // logSection("1. Stringify Messages (Default Options)");
  // const stringified = stringify(sampleMessages);
  // log(stringified);
  // logSection("2. Parse Stringified Messages");
  // const parsed = parse(stringified);
  // log("Parsed structure:");
  // log(JSON.stringify(parsed, null, 2));
  // logSection("3. Stringify Messages with Indentation");
  // const indentedStringified = stringify(sampleMessages, { indent: 2 });
  // log(indentedStringified);
  // logSection("4. Stringify Messages without Boundaries");
  // const noBoundariesStringified = stringify(sampleMessages, {
  //   showBoundary: false,
  // });
  // log(noBoundariesStringified);
  // logSection("5. Parse and Verify Specific Elements");
  // const reparsed = parse(stringified);
  // log("Parsed structure:");
  // log(JSON.stringify(reparsed, null, 2));
  // if (reparsed[0] && reparsed[0].content) {
  //   log("First message content:", reparsed[0].content);
  // } else {
  //   log("Error: Unable to access first message content");
  // }
  // if (reparsed[0] && reparsed[0].responses) {
  //   log("Number of responses to first message:", reparsed[0].responses.length);
  // } else {
  //   log("Error: Unable to access responses of first message");
  // }
  // if (reparsed[1] && reparsed[1].attachments && reparsed[1].attachments[0]) {
  //   log("First attachment name:", reparsed[1].attachments[0].headers.Name);
  // } else {
  //   log("Error: Unable to access first attachment name");
  // }
  logSection("6. Roundtrip Test");
  const roundtrip = parse(stringify(sampleMessages));
  console.log(JSON.stringify(sampleMessages, null, 2));
  console.log(stringify(sampleMessages));
  console.log({ roundtrip });

  log("Roundtrip result:");
  log(JSON.stringify(roundtrip, null, 2));
  log(
    "Roundtrip successful:",
    JSON.stringify(roundtrip) === JSON.stringify(sampleMessages)
  );
}

runDemo().catch(console.error);
