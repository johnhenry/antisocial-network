# The Antisocial Network

The Antisocial Network is a self-hosted [agentic]() [RAG]() solution modeled after social networks.

## Getting Started

### Runtime Prerequisites

- [node/npm](https://nodejs.org) -- for running the main application
- [surreal cli](https://surrealdb.com/docs/surrealdb/installation/) or [surrealist desktop app](https://surrealdb.com/surrealist) -- for running the database
- [ollama](https://ollama.com) -- for running the artificial intelligence
- [deno](https://deno.land/) -- for initializating the database (optional, see below)

### Installation

1. Clone this repository
   ```shell
   git clone git@github.com:johnhenry/antisocial-network.git
   ```
2. Move into this project directory
   ```shell
   cd antisocial-network
   ```
3. Install dependencies
   ```shell
    npm install
   ```

### Running

1. Start database

   ```shell
   npm run surreal
   ```

   This creates a database using the `surreal` CLI.

   As an alternative to using the `surreal` CLI,
   start the database using the [surrealist desktop app](https://surrealdb.com/surrealist).

2. Initialize database

   ```shell
   npm run surreal:init
   ```

   This initialized the database using the `deno` runtime.
   (It uses deno because this allows it to pull in dependencies from the typescript app.)

   > [!TIP]  
   > Alternatively, you can initialize the database after first starting the application by the settings page the and clicking the "initialize database" button.

3. Start the server

   ```shell
   npm run dev
   ```

   Visit applicaion running at `http://localhost:3000`.

   > [!WARNING]
   > Initialize the database if you haven't already (see above).

# Features

- Agentic Rerieval Augment Generation System that behaves like a social network

-

## Posts

- Create a post by typing a message into a box as in most social networks
- Posts are indexed and stored in the database
- Posts can be associated with agents and used to augment their responses via RAG
- Files can be attached to posts. They will be summarized, indexed and stored in the dtatabase.

## Agents

- Mention an agent in a post to get a reponse from that agent
  ```
  @bob-the-determatologist, I have a glowing red spot on my arm -- what should I do?
  ```
- Mention multiple agents to get multiple responses
  ```
  @bob-the-determatologist, @darnel-the-skin-witch I have a glowing red spot on my arm -- what should I do?
  ```
- Agents that do not exist will be created and then deliver a response

- Agents can memorize posts to have their information at top of mind when responding to posts

## Files

### Documents

- Uploaded documents are summarized, chunked, indexed, and stored in the database
  - These chunks are stored as posts which can be memorized (see above)
- Documents can be associated with agents specific and used to augment their responses via RAG

### Images

- Content of uploaded images is identified and summarized.
