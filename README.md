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
