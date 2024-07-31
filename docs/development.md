# Development

These applications can make development easier, but are not required.

## Applications

- [Visual Studio Code](https://code.visualstudio.com) AND
  [Edge](https://microsoft.com/edge) w/ [Dev Tools Extension](https://marketplace.visualstudio.com/items?itemName=ms-edgedevtools.vscode-edge-devtools) OR [Chrome](https://google.com/chrome)

  There's a launch configuration for debugging in the `.vscode` folder.
  Use the "Edge+" or "Chrome+" to launch the full application in a browser.
  I recommend edge because of the Dev Tools Extension for browser debugging.

- [surrealist desktop app](https://surrealdb.com/surrealist)

  This desktop application allows you to view the database in a more visual way.

## Scripts

`package.json` has a few useful scripts that will help development.

### Backend Services

- `npm run db` start the database server
- `npm run files` start the file storage server
- `npm run cron` start the scheduling server
- `npm run backend` start all backend services

### Reset Databases

- `npm run file:reset` reset file storage
- `npm run db:reset` reset the database
- `npm run all:reset` reset database and file storage

### Frontend

- `npm run frontend` start the frontend application
- `npm run dev` start the frontend application in development mode
