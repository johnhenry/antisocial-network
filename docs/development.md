# Development

These applications can make development easier, but are not required.

## Applications

- [Visual Studio Code](https://code.visualstudio.com) AND
  [Edge](https://microsoft.com/edge) w/ [Dev Tools Extension](https://marketplace.visualstudio.com/items?itemName=ms-edgedevtools.vscode-edge-devtools) OR [Chrome](https://google.com/chrome)

  There's a launch configuration for debugging in the `.vscode` folder.
  Use the "Edge[S]" or "Chrome[S]" to launch the full application in a browser.
  I recommend edge because of the Dev Tools Extension for browser debugging.

- [surrealist desktop app](https://surrealdb.com/surrealist)

  This desktop application allows you to view the database in a more visual way.

## Scripts

`package.json` has several useful scripts to help with development:

### Backend Services

- `npm run db`: Start the database server
- `npm run files`: Start the file storage server
- `npm run cron`: Start the scheduling server
- `npm run backend`: Start all backend services

### Reset Databases

- `npm run file:reset`: Reset file storage
- `npm run db:reset`: Reset the database
- `npm run all:reset`: Reset database and file storage

### Frontend

- `npm run frontend`: Start the frontend application
- `npm run dev`: Start the frontend application in development mode
