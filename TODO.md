# The Antisocial Network (TODO)

## Done

- Bookmakring
  - [x]Allow bookmarking for documents
  - [x] Allow memorization for memes
- [x] Use AI to create name for agents

## In progress

- [x] Parse Content for memes

- [ ] Add per-agent parameters
  - [x] temperature
  - [x] model
  - etc.
    - https://api.python.langchain.com/en/latest/chat_models/langchain_community.chat_models.ollama.ChatOllama.html
    - https://v02.api.js.lang
- note, this is currently set as "model", but should be "parameters"
- [ ] Rest API
- [ ] - [ ] https://v02.api.js.langchain.com/interfaces/langchain_community_chat_models_ollama.ChatOllamaInput.html

## Planned

- [ ] Store and retrieve relevant knowledge when answering (search: `relevantKnowledge` function)
- [ ] Environment Variables
- [ ] Masquerading
  - [x]Allow masquerading as other agents
    - [ ] Add appropriate memorization/bookmarking buttons (lightbult/bookmark)
- [ ]Add loading/suspense for search, loading entieies
- [ ] Add limits to file sizes and handle errors better
  - [ ] Find what the limits are and what specifically causes the error
- [ ] Improve Search
- [ ] Format responses
- [ ] Mobile CSS
- [ ] Upload images for agents

- [ ] implement tools
  - https://dev.to/vyan/public-apis-for-web-development-projects-lhk
  - https://github.com/public-api-lists/public-api-lists
- misc:
  - summaries of documents shoud be included in [initial] agent description
  - if name is empty, or 0 generate it from the document content
  - if name is 1, generate a random name
- [ ] add generic agents
  - [ ] @GenEric agent:generic
  - [ ] @HelpfulHenry agent:helpfufhelry

## Investigate/Consider

- Investigate using vector similarities between system prompts instead of function calling to rank agents
- Consider an api that returns the id or a post or agent before it's finished being created
- Disallow memorization for non-naked memes
- Continue investigate using service worker for notifications

- [Bulk] upload files, agents and memes

  - file

  ```shell
  npm run antisocial file --help
  usage: npm run antisocial file -- [path to file]

  options
    -d --directory [directory]  path to directory
    -a --agent [agent]  agent to upload meme to
  ```

  - agent

  ```shell
  npm run antisocial agent --help
    -n --name
    -f --content
  ```

  - memes

  ```shell
  npm run antisocial meme --help
  usage: npm run antisocial meme -- [content of meme]

  options
    -f --file [file]  file to upload
    -a --agent [agent]  agent to upload meme to
  ```
