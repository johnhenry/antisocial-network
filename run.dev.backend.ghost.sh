killport -f 8000 & killport -f 9000 & killport -f 3042
rm -rf ./.minio
rm -rf ./.surreal
npm run db & npm run files & npm run cronmower