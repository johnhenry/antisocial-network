import { stringify } from "./index.mjs";

let input = [
  [
    {
      name: "thread_root",
      type: "text/plain",
      _: "This is the root of a conversation thread.",
    },
    [
      {
        name: "reply1",
        type: "text/plain",
        _: "This is a reply to the root message.",
      },
      [
        {
          name: "reply1_1",
          type: "text/plain",
          _: "This is a reply to the first reply.",
        },
      ],
    ],
  ],
];

console.log(stringify(input));
