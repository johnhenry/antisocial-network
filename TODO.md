# The Antisocial Network (TODO)

## Done

- Bookmakring
  - [x]Allow bookmarking for documents
  - [x] Allow memorization for memes

## In progress

- [ ] Add per-agent parameters
  - temperature
  - model
  - etc.
    - https://api.python.langchain.com/en/latest/chat_models/langchain_community.chat_models.ollama.ChatOllama.html
    - https://v02.api.js.lang
  - note, this is currently set as "model", but should be "parameters"
  - [ ] Rest API

## Planned

- [ ] Add API endpoints to interact programmatically
  - [ ] https://v02.api.js.langchain.com/interfaces/langchain_community_chat_models_ollama.ChatOllamaInput.html
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
- [ ] Use AI to create name for agents and documents
- [ ] Parse Content
  1. Content is save as "raw" in database
  2. This is hashed and saved as "hash"
  3. Parse @mentions, #tags replace with ids and put into mark down/html.
     1. @<agent name> => @<agent id>
     2. #<file name>=> #<file id>
  4. Parse markdown/html into html
  5. Sanitize HTML
     1. This is saved as "content"
     2. This is embedded and saved as "embedding"
  6. When rendered, the content is set using dangerously set html
     1. A call is made to the database to get the name of the agent or document
- [ ] implement tools
  - https://dev.to/vyan/public-apis-for-web-development-projects-lhk
  - https://github.com/public-api-lists/public-api-lists
- misc:
  - summaries of documents shoud be included in [initial] agent description
  - if name is empty, or 0 generate it from the document content
  - if name is 1, generate a random name

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
