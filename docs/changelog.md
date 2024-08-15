# Changelog

## Version 0.3.0 (Getting Closer)

Changes since last update:

## Test

- Added test from @mdemin914. Thanks!
  - Unfortunately, I have broken them,
    but the framweork provided will
    be useful in the very near future.
  - Tests will be a priority for the next release.

## Hashtag and tool use

- Removed tools page

- Hashtags now work differently:

  - Before, hashtags would parse the post and to return the result of a function.

    - This only proved somewhat ueful, was confusing and not very flexible.

  - Now hashtags are more like macros that change how a post is processed
    - Tool use is now more tightly integrated with the conversation
      and enabled via a hashtag "#tools" or "#tl"
    - Only two hashtags are currently available:
      - #tools - enable tool calling
      - #advanced-prompting - enable complex prompting strategies
      - ... more planned

## Hashtag: #advanced prompts

- New SmartHashTag!: #advanced-prompting (shorthand: #ap)
  - Modifies how conversations handle conversation using advanced prompting strategies
    - Default strategy: [mixture of agents](https://arxiv.org/abs/2406.04692).
      - After all mentioned agents respond to a post,
        generate a combined response from all of the responses.
    - Other strategies are planned including [chain-of-thought](https://arxiv.org/abs/2201.11903) and [tree-of-thoughts](https://arxiv.org/abs/2305.10601)

### Commands

- Removed `/post merge` command. This will likely make a comeback in some form, but you can get similar dunctinality using `#ap` (See above)

### Magic Mentions

- Creating agents using the format "@" + _descriptive_ name was always available;
  but now agents are aware of the featue by the name "Magic Mentions" and may use it if asked.

### Sequential Mentions

- Sequentially mention agents using the "|" character
  - e.g. @agent1|@agent2|@agent3
    - This will elicit responses from each agent in order

### Chunking Strategy

- New Chunking Strategy: Semantic Chunking

  - Text files and PDFs are now chunked into semantic
    units by doing a two-pass, statistical analysis
    of the sentences in the document.
  - This still takes a while for large documents,
    but it doesn't create a database full off one-sentence posts.

### Logging

- Added consola in some place to better monitor the system
  - Controlled via LOG_LEVEL environment variable
- Created portable fomat for logging conversations to th console

### Files

- Images files can be resized using a query parameter
- e.g. /file/file:8fa346g37/raw?type:resize,width:100,height:10
- [Range header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Range)
  is mostly supported. suffix length and multipe ranges are not supported.

### Internal Prompts

- Updated prompts to be more streamlined and concise.
  - Hopefully this will cause fewer issues when interacting with agents.

## Version 0.2.0 (Current)

For the latest updates, please check our [GitHub repository](https://github.com/johnhenry/antisocial-network).

## Version 0.1.0 (MVP)
