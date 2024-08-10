Please help me write a parser in javascript that will parse a string of possibly nested messages into possibly nested array of objects representing those messages.
Top level messages use the same boundary. Ask questions to under any ambiguities that I may have introduced. Write tests using node:test and node:assert

Note that content-length is dynamically calculated.
content-transfer-encoding will always be base64 for files.

Also, make sure to write code using the latest modern javascript features including es6 modules.

Put the main module in parse.mjs it should export a single function parse.
Because we probably won't get it on the first try, add some logging/debugging statements to the initial pass code.

Put the tests in parse.test.mjs. Test should be expansive.
They should test for properly calculated length, properly set file types, proper nesting, etc. They should use multiple example strings to parse.

Here's an example of the input string:

```plaintext
Content-Length: 1075
Content-Type: multipart/mixed
Boundary: AaB03x

--AaB03x
Content-Disposition: post
Name: mr-monroe
Source: agent:12345
Content-Length: 16
Content-Type: text/plain
Boundary: CcD05z

Hello students.

--CcD05z
Content-Disposition: post
Name: becky
Source: agent:23456
Content-Length: 13

Hello Teacher
--CcD05z
Content-Disposition: post
Name: tanya
Source: agent:34567
Content-Length: 25
Boundary: BbC04y

Good morning! Mr. Monroe!

--BbC04y
Content-Disposition: post
Name: becky
Source: agent:23456
Content-Length: 42

He's never going to notice you agent:34567
--BbC04y--
--CcD05z--
--AaB03x
Content-Disposition: post
Name: mr-monroe
Source: agent:12345
Content-Length: 43
Boundary: DdE06w

Today we have a special image to show you.

--DdE06w
Content-Disposition: file
Name: fancy.jpg
Content-Type: image/jpeg
Content-Transfer-Encoding: base64
Content-Length: 28

ABDZJRU5ErkJproject_plan_pdf==
--DdE06w
Content-Disposition: post
Name: tanya
Source: agent:34567
Content-Length: 28

That's beautiful Mr. Monroe!
--DdE06w--
--AaB03x
Content-Disposition: post
Name: mr-monroe
Source: agent:12345
Content-Length: 35

I hope you all had a good vacation.
--AaB03x--
```

And here is the expected result

```javascript
[
  [
    {
      name: "mr-monroe",
      source: "agent:12345",
      length: 16,
      type: "text/plain",
      _: "Hello students.\n",
      attachments: [],
    },
    [
      [
        {
          name: "becky",
          source: "agent:23456",
          length: 13,
          _: "Hello Teacher",
          attachments: [],
        },
      ],
      [
        {
          name: "tanya",
          source: "agent:34567",
          length: 25,
          _: "Good morning! Mr. Monroe!\n",
          attachments: [],
        },
        [
          {
            name: "becky",
            source: "agent:23456",
            length: 42,
            _: "He's never going to notice you agent:34567",
            attachments: [],
          },
        ],
      ],
    ],
  ],
  [
    {
      name: "mr-monroe",
      source: "agent:12345",
      length: 43,
      _: "Today we have a special image to show you.\n",
      attachments: [
        {
          name: "fancy.jpg",
          type: "image/jpeg",
          length: 28,
          _: "ABDZJRU5ErkJproject_plan_pdf==",
        },
      ],
    },
    [
      {
        name: "tanya",
        source: "agent:34567",
        length: 28,
        _: "That's beautiful Mr. Monroe!",
        attachments: [],
      },
    ],
  ],
  [
    {
      name: "mr-monroe",
      source: "agent:12345",
      length: 35,
      _: "I hope you all had a good vacation.",
      attachments: [],
    },
  ],
];
```
