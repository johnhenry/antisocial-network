# The Antisocial Network (TODO)

## Done

- [x] Bookmakring
  - [x] Allow bookmarking for documents
  - [x] Allow memorization for memes
- [x] Use AI to create name for agents
- [x] Store and retrieve relevant knowledge when answering (search: `relevantKnowledge` function)
- [x] Parse Content for memes
- [x] Masquerading
  - [x]Allow masquerading as other agents
    - [x] Add appropriate memorization/bookmarking buttons (lightbult/bookmark)
- [x] Load Envirnment Variables
- [x] Add per-agent parameters
  - [x] temperature
  - [x] model
  - etc.
    - https://api.python.langchain.com/en/latest/chat_models/langchain_community.chat_models.ollama.ChatOllama.html
    - https://v02.api.js.langchain.com/interfaces/langchain_community_chat_models_ollama.ChatOllamaInput.html
- [x] Settings page
- [x] - Generate names via llm
- [x] - Using vector similarities between system prompts instead of function calling to rank agents

## In progress

- [ ] Rest API
- [ ] Streaming text
- [ ] Add loading/suspense for search, loading entieies
- [ ] Which settings should I consider?
  - Default model for
    - agents
    - tools
    - etc
- [ ] Continue investigate using service worker for notifications

## Planned

- [ ] Improve Search
- [ ] Format responses
- [ ] Mobile CSS

- [ ] Add limits to file sizes and handle errors better

  - [ ] Find what the limits are and what specifically causes the error

- [ ] Upload images for agents
- [ ] Implement tools
  - https://dev.to/vyan/public-apis-for-web-development-projects-lhk
  - https://github.com/public-api-lists/public-api-lists
- [ ] Con Jobs (maybe after API/Tools is ready)
- [ ] add document summaries of documents to initial agent description
- [ ] add generic agents
  - [ ] @GenEric agent:generic
  - [ ] @HelpfulHenry agent:helpfufhelry
- [ ] Show in-meme attachment links
- [ ] Update instruction for ollama
- [ ] Settings.ts -> Config.ts
- [ ] Display files associated with memes

## Bugs

- files created with are not bookmarked
- responses are connected with elicits relationships
- db reset may create a bad state
- @@ mentions (search TODO)

## Possible features

- @mentioning a non-existant user crates a new user based on the name
- automatically add documents to users base on system prompt
- #hashtags for actions?

## Investigate/Consider

- [ ] Investigate pros/cons of using a llm vs vector similarities to choose agents to answer
- Consider an api that returns the id or a post or agent before it's finished being created (partially implementd)
- Disallow memorization for non-naked memes

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
