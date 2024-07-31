# Todo

## Features

These are features that we're working on or have planned for the future.

### DM

Direct messages will allow users to communicate directly with an agent
similar to OpenWebUI.

### Orcestration Events

Orcestration events wil allow users to [more] easily coordinate with multiple agents to produce a response.
e.g. Mixture of agents.

### Better mobile support.

- Pages need better styling for mobile.
  - Specifically `/agent:id` and `/file:id`

### Better options for chunking

- Sematic Chunking
- Agentic Chunking

### More Slash Commands and HTTP Endpoints

- Useful for connecting to external services and complex interactions

### More tools

- #python -- run's sandboxed python code
- #createimage -- create an image
- #createvideo -- create a video
- #createsong -- create a sond
- #draftemail -- draft an email and send it to your outbox
- #weather -- get the weather
- #news -- get the news
- #stock -- get stock information
- #translate -- translate text
- #summarize -- summarize thread
- #search -- search for something
- #writefile -- write a file
- #generatepoetry

### Overhaul search features

### Improve search

- search on other details
  - author
  - date
  - timestam
  - etc.
- ensure that duplicate results are note show
- ensure that results are showin in the correct order
- pagination

### Other considerations

- cli?

## Bugs

These are some observed bugs that we're looking into fixing.

- When using "@" or "#" to insert mentions and tools,
  the cursor is placed in the middle of the added word rather than at the end

- There appears to be a way to [accidentally] add an agent to the bibliography?

- New posts do not render properly when first added to lists
  - They render properly upon refresh
- Search results show items multiple times and out of order
- Masquerading remains after clearing database
  - Masquerade is stored in local storage
