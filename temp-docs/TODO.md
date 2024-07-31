## Bugs

- New posts do not render properly when first added to lists
  - They render properly upon refresh
- Search results show items multiple times and out of order
- Masquerading remains after clearing database
  - Masquerade is stored in local storage
- Records point to static objects and not the actual objects themselves.
  - They should point to the database objects instead.

## Features

### Containerization

- dockerize application
- investigate Nvidia NIM

### Search

- Add search filter buttons
  - by content
  - by timestamp
  - by name
  - by date
  - by author
  - by owner
  - by type

## Bookmarking

- implement ui
- implement command
  - delete

## Memorization

- implelment ui
- implement command
  - create
  - delete

## Responses

- Check that responses with mentions are responded to
- Stop automatic responses at depth

## Schedule page

- Add coming soo. Describe some ideas

## Help Page

## Documentations

## Video

## page: post/:id

- elicited and target should be wider by default
- add button to navigate to document if contained
  - also add buttons to navigate to other memes in the document
- Render post to html everywhere
  - target
  - elicited
- slash commands should offer to redirect to created files, agents
  - via popup
  - on / as well

## Other

- Delete/hide
  - Posts
  - Files
  - Agents

# The Antisocial Network (TODO)

- [x] Add search filter buttons
- [ ] Style response meme better
- [ ] Fix bookmarking/memorization
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
- [x] Continue investigate using service worker for notifications
- [ ] Use external providers
  - [x] Groq
  - [x] Open AI
  - [x Anthropic
- [x] Settings

  - [x] Default model for
    - agents
    - tools
    - vision
    - etc
  - [x] Chunking strategy (only senetence implemented):
    - sentence
    - semantic
    - agentic
  - [x] Settings should be more table-like
  - [x] Masquerate should be "list of agents" with a masquerae radio toggle

- [ ] Rest API
  - [x] POST
    - [x] new file
    - [x] new agent
    - [x] new meme
  - [ ] GET
    - [ ] agent
    - [ ] meme
    - [x] file
- [x] Streaming text
- [ ] Add loading/suspense for search, loading entieies
- [ ] Improve Search
- [ ] Visuals

  - [ ] /
    - [x] Use range to define search limit
    - [ ] Make go button bigger as it's now alone
      - [ ] Add create file and create agent buttons next to go button
  - [ ] /meme
    - [ ] Update rendering
  - [ ] /file
  - [ ] /agent

- [ ] Format responses
- [ ] Mobile CSS

- [ ] Add limits to file sizes and handle errors better

  - [ ] Find what the limits are and what specifically causes the error

- [ ] Upload images for agents
- [ ] Implement tools
  - https://dev.to/vyan/public-apis-for-web-development-projects-lhk
  - https://github.com/public-api-lists/public-api-lists
- [ ] Cron Jobs (maybe after API/Tools is ready)
- [ ] add document summaries of documents to initial agent description?
- [ ] add generic agents
  - [ ] @GenEric agent:generic
  - [ ] @HelpfulHenry agent:helpfufhelry
- [ ] Show in-meme attachment links
- [ ] Update instruction for ollama
- [ ] Settings.ts -> Config.ts
- [ ] Meme -> Post
- [ ] Display files associated with memes
- [ ] Now that i can get a bunch of agents too answer a single post, i need a final agent that can combine the reponses to a post
  - @SynthezingSamuel#
  - $ystem <commands>
  - $ystem aggregate --agent --target --
  - /synthesize --depth=1

## Bugs

- files created with agent are not properly bookmarked?
- responses are connected with elicits relationships?
- db reset may create a bad state?
- id not converted propertly when reading -- doing searc/retrieving items
  - also check updates
- I think there's a reaction between service worker notification and in-page notifications.

## Possible features

- @mentioning a non-existant user crates a new user based on the name
- automatically add documents to users base on system prompt
- #hashtags for actions?
  - @<agent-name>
    - Evokes a response from the agent mentiond
    - If the agent is not found, the system will attempt to create a new agent with the name
  - @#<action-name>
    - @#createatent:<name> create an agent using the surrounding context
    - @#nosave (don't save the response -- useful along other commans)
    - @#noindex
    - @#anyone:<n> get responses from n agents at random
    - @#best:<n> get responses from the best agent
    - @#hidecommands
    - @#help
    - @system:

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

| Feature  | Description                |
| -------- | -------------------------- |
| Search   | Add search filter buttons  |
| Response | Style response meme better |
