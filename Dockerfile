FROM node:alpine

COPY . .

CMD ["node","server.js"]
