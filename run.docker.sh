rm -rf ./node_modules/
npm install --legacy-peer-deps
npm run build
npm run db & npm run files & npm run cronmower & fg

