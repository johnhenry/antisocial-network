# Multipart Parser Test Cases

This document contains all the sample cases created for testing the multipart parser.

## 0. Initial Example

```
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

Expected Result:

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

## 1. Simple Message

```
Content-Length: 100
Content-Type: multipart/mixed
Boundary: simple

--simple
Content-Disposition: post
Name: test
Source: agent:12345
Content-Length: 11
Content-Type: text/plain

Hello World
--simple--
```

Expected Result:

```javascript
[
  [
    {
      name: "test",
      source: "agent:12345",
      length: 11,
      type: "text/plain",
      _: "Hello World",
      attachments: [],
    },
  ],
];
```

## 2. Nested Messages

```
Content-Length: 300
Content-Type: multipart/mixed
Boundary: outer

--outer
Content-Disposition: post
Name: parent
Source: agent:12345
Content-Length: 20
Content-Type: text/plain
Boundary: inner

Parent message here

--inner
Content-Disposition: post
Name: child
Source: agent:67890
Content-Length: 18

Child message here
--inner--
--outer--
```

Expected Result:

```javascript
[
  [
    {
      name: "parent",
      source: "agent:12345",
      length: 20,
      type: "text/plain",
      _: "Parent message here\n",
      attachments: [],
    },
    [
      {
        name: "child",
        source: "agent:67890",
        length: 18,
        _: "Child message here",
        attachments: [],
      },
    ],
  ],
];
```

## 3. File Attachments

```
Content-Length: 300
Content-Type: multipart/mixed
Boundary: main

--main
Content-Disposition: post
Name: withfile
Source: agent:12345
Content-Length: 20
Boundary: file

Message with file

--file
Content-Disposition: file
Name: test.txt
Content-Type: text/plain
Content-Transfer-Encoding: base64
Content-Length: 16

SGVsbG8gZnJvbSBmaWxl
--file--
--main--
```

Expected Result:

```javascript
[
  [
    {
      name: "withfile",
      source: "agent:12345",
      length: 20,
      _: "Message with file\n",
      attachments: [
        {
          name: "test.txt",
          type: "text/plain",
          length: 16,
          _: "SGVsbG8gZnJvbSBmaWxl",
        },
      ],
    },
  ],
];
```

## 4. Multiple Top-level Messages

```
Content-Length: 200
Content-Type: multipart/mixed
Boundary: multi

--multi
Content-Disposition: post
Name: first
Source: agent:11111
Content-Length: 11

First post

--multi
Content-Disposition: post
Name: second
Source: agent:22222
Content-Length: 12

Second post
--multi--
```

Expected Result:

```javascript
[
  [
    {
      name: "first",
      source: "agent:11111",
      length: 11,
      _: "First post\n",
      attachments: [],
    },
  ],
  [
    {
      name: "second",
      source: "agent:22222",
      length: 12,
      _: "Second post",
      attachments: [],
    },
  ],
];
```

## 5. Content Length Calculation

```
Content-Length: 100
Content-Type: multipart/mixed
Boundary: length

--length
Content-Disposition: post
Name: length-test
Source: agent:12345
Content-Length: 50

This content is exactly thirty-five bytes.
--length--
```

Expected Result:

```javascript
[
  [
    {
      name: "length-test",
      source: "agent:12345",
      length: 35,
      _: "This content is exactly thirty-five bytes.",
      attachments: [],
    },
  ],
];
```

## 6. Multiple Nested Levels

```
Content-Type: multipart/mixed
Boundary: level1

--level1
Content-Type: text/plain
Content-Disposition: inline; name="level1-content"

This is level 1 content.

--level1
Content-Type: multipart/mixed
Boundary: level2

--level2
Content-Type: text/plain
Content-Disposition: inline; name="level2-content"

This is level 2 content.

--level2
Content-Type: multipart/mixed
Boundary: level3

--level3
Content-Type: text/plain
Content-Disposition: inline; name="level3-content"

This is level 3 content.

--level3--
--level2--
--level1--
```

Expected Result:

```javascript
[
  [
    {
      name: "level1-content",
      type: "text/plain",
      _: "This is level 1 content.",
      attachments: [],
      length: 24,
    },
    [
      {
        name: "level2-content",
        type: "text/plain",
        _: "This is level 2 content.",
        attachments: [],
        length: 24,
      },
      [
        {
          name: "level3-content",
          type: "text/plain",
          _: "This is level 3 content.",
          attachments: [],
          length: 24,
        },
      ],
    ],
  ],
];
```

## 7. Mixed Content Types

```
Content-Type: multipart/mixed
Boundary: mixedcontent

--mixedcontent
Content-Type: text/plain
Content-Disposition: inline; name="text-content"

This is plain text content.

--mixedcontent
Content-Type: text/html
Content-Disposition: inline; name="html-content"

<html><body><h1>This is HTML content.</h1></body></html>

--mixedcontent
Content-Type: application/json
Content-Disposition: attachment; name="json-content"

{"key": "This is JSON content"}

--mixedcontent--
```

Expected Result:

```javascript
[
  {
    name: "text-content",
    type: "text/plain",
    _: "This is plain text content.",
    attachments: [],
    length: 26,
  },
  {
    name: "html-content",
    type: "text/html",
    _: "<html><body><h1>This is HTML content.</h1></body></html>",
    attachments: [],
    length: 55,
  },
  {
    name: "json-content",
    type: "application/json",
    _: '{"key": "This is JSON content"}',
    attachments: [],
    length: 31,
  },
];
```

## 8. Multiple File Attachments

```
Content-Type: multipart/mixed
Boundary: fileattachments

--fileattachments
Content-Type: text/plain
Content-Disposition: inline; name="main-content"

This is the main content.

--fileattachments
Content-Type: image/jpeg
Content-Disposition: attachment; name="image1.jpg"
Content-Transfer-Encoding: base64

SGVsbG8sIHRoaXMgaXMgYSB0ZXN0IGltYWdlIQ==

--fileattachments
Content-Type: application/pdf
Content-Disposition: attachment; name="document.pdf"
Content-Transfer-Encoding: base64

VGhpcyBpcyBhIHRlc3QgUERGIGRvY3VtZW50

--fileattachments--
```

Expected Result:

```javascript
[
  {
    name: "main-content",
    type: "text/plain",
    _: "This is the main content.",
    attachments: [],
    length: 25,
  },
  {
    attachments: [
      {
        name: "image1.jpg",
        type: "image/jpeg",
        _: "SGVsbG8sIHRoaXMgaXMgYSB0ZXN0IGltYWdlIQ==",
        length: 36,
      },
    ],
    _: "",
  },
  {
    attachments: [
      {
        name: "document.pdf",
        type: "application/pdf",
        _: "VGhpcyBpcyBhIHRlc3QgUERGIGRvY3VtZW50",
        length: 32,
      },
    ],
    _: "",
  },
];
```
