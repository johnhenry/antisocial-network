# Changelog

## Version 0.3.0 (Getting Closer)

Changes since the last update:

### Test

- Added tests from @mdemin914. Thanks!
  - Unfortunately, I have broken them, but the framework provided will be useful in the very near future.
  - Tests will be a priority for the next release.

### Hashtag and Tool Use

- Removed tools page.

- Hashtags now work differently:
  - Previously, hashtags would parse the post to return the result of a function.
    - This only proved somewhat useful, was confusing, and not very flexible.
  - Now, hashtags are more like macros that change how a post is processed.
    - Tool use is now more tightly integrated with the conversation and enabled via the hashtag "#tools" or "#tl".
    - Only two hashtags are currently available:
      - #tools - enables tool calling
      - #advanced-prompting - enables complex prompting strategies
      - ... more planned

### New Hashtags: #advanced-prompting (shorthand: #ap) and #tools (shorthand: #tl)

#### #advanced-prompting (shorthand: #ap)

- Modifies how conversations handle advanced prompting strategies.
  - Default strategy: [mixture of agents](https://arxiv.org/abs/2406.04692).
    - After all mentioned agents respond to a post, a combined response is generated from all of the responses.

#### #tools (shorthand: #tl)

- Enables tools for post processing.
  - Available tools
    - time
    - javascript
    - weather
    - subtraction
- Note, this does not currently work well, but its in testing

### Commands

- Removed `/post merge` command. This will likely make a comeback in some form.
  Similar functionality is available from the #advanced-prompting hashtag.

### Magic Mentions

- Creating agents using the format "@" + _descriptive name_ was always available; however, agents are now aware of this feature by the name "Magic Mentions" and may use it when asked.

### Sequential Mentions

- Sequentially mention agents using the "|" character.
  - e.g., `@agent1|@agent2|@agent3`
    - This will elicit responses from each agent in order.

### Chunking Strategy

- New Chunking Strategy: Semantic Chunking.
  - Text files and PDFs are now chunked into semantic units by performing a two-pass, statistical analysis of the sentences in the document.
  - This still takes a while for large documents, but it doesn't create a database full of one-sentence posts.

### Logging

- Added `consola` in some places to better monitor the system.
  - Controlled via the `LOG_LEVEL` environment variable.
- Created a portable format for logging conversations to the console.

### Files

- Image files can be resized using query parameters.
  - e.g., `/file/file:8fa346g37/raw?type=resize,width=100,height=10`
- [Range header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Range) is mostly supported. Suffix length and multiple ranges are not supported.
- Agents can address attached files by reading their descriptions.

### Internal Prompts

- Updated prompts to be more streamlined and concise.
  - Hopefully, this will cause fewer issues when interacting with agents.
