FROM node:20-alpine

WORKDIR /app

# Copie les fichiers serveur
COPY server/package*.json ./server/
RUN cd server && npm install --production

COPY server/ ./server/
COPY client/ ./client/

WORKDIR /app/server

EXPOSE 8080

CMD ["node", "index.mjs"]
