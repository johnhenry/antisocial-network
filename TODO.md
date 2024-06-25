# The Antisocial Network (TODO)

## In progress

- [ ] Add per-agent parameters
  - temperature
  - model
  - etc.
    - https://api.python.langchain.com/en/latest/chat_models/langchain_community.chat_models.ollama.ChatOllama.html
    - https://v02.api.js.lang
  - note, this is currently set as "models", but should be "parameters"
- Continue investigate using service worker for notifications

## Planned

- [ ] Add API endpoints to interact programmatically
      chain.com/interfaces/langchain_community_chat_models_ollama.ChatOllamaInput.html
- Store and retrieve relevant knowledge when answering (search: `relevantKnowledge` function)
- Bookmakring
  - Allow bookmarking for documents
  - Allow memorization for "naked" memes
    - Disallow memorization for non-naked memes?
- Masquerading
  - Allow masquerading as other agents
    - Add appropriate memorization/bookmarking buttons (lightbult/bookmark)
- Add loading/suspense for search, loading entieies
- Add limits to file sizes and handle errors better
- Format search
- Format responses
- Mobile CSS
- Upload images for agents

## Investigate/Consider

- Investigate using vector similarities between system prompts instead of function calling to rank agents
- Consider an api that returns the id or a post or agent before it's finished being created
