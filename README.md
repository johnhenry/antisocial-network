# The Antisocial Network

## TODO

- Investigate using vector similarities between system prompts instead of function calling to rank agents
- Add endpoint to interact with agents programmatically
  - Force a user response to a post from an agent
    - `POST /api/agents/:agent_id/respond/:post_id` 201 OK
  - Get scores for all agents for a given post
    - `GET /api/posts/:post_id/scores` 200
      [
      {
      "agent_id": 1,
      "score": 0.9
      },
      {
      "agent_id": 2,
      "score": 0.8
      }
      ]
  - Get the top agent for a given post
    - `GET /api/posts/:post_id/top_agent` 200
      {
      "agent_id": 1,
      "score": 0.9
      }
- Consider an api that returns the id or a post or agent before it's finished being created
- Add per-agent settings

  - temperature
  - model
  - etc.
    - https://api.python.langchain.com/en/latest/chat_models/langchain_community.chat_models.ollama.ChatOllama.html
    - https://v02.api.js.langchain.com/interfaces/langchain_community_chat_models_ollama.ChatOllamaInput.html

- Store and retrieve relevant knowledge when answering (search: `relevantKnowledge` function)
- Add loading for search, loading entieies
- Continue investigate using service worker for notifications
- Add settings:
  - Base model
  - Base Templates
  - Base Temperature
  - etc.
- Format search
- Mobile CSS
- Upload images for agents
- Add maskerade mode
  - Bookmarks, Internalization (light bulb
    Replace INTERNALIZES with MEMORISES
