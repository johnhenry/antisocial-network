# Development

These applications can make development easier, but are not required.

## Applications

- [Visual Studio Code](https://code.visualstudio.com) AND
  [Edge](https://microsoft.com/edge) with [Dev Tools Extension](https://marketplace.visualstudio.com/items?itemName=ms-edgedevtools.vscode-edge-devtools) OR [Chrome](https://google.com/chrome)

  There is a launch configuration for debugging in the `.vscode` folder.  
  Use the "w/edge" or "w/chrome" configuration to launch the full application in a browser.  
  I recommend Edge because of the Dev Tools Extension for browser debugging.

- [Surrealist Desktop App](https://surrealdb.com/surrealist)

  This desktop application allows you to view the database in a more visual way.

## Scripts

`package.json` contains several useful scripts to help with development:

### Backend Services

- `npm run db`: Start the database server.
- `npm run files`: Start the file storage server.
- `npm run cron`: Start the scheduling server.
- `npm run backend`: Start all backend services.

### Reset Databases

- `npm run file:reset`: Reset file storage.
- `npm run db:reset`: Reset the database.
- `npm run all:reset`: Reset the database and file storage.

### Frontend

- `npm run frontend`: Start the frontend application.
- `npm run dev`: Start the frontend application in development mode.
