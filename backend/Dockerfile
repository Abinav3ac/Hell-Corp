FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm install

COPY . .

RUN mkdir -p uploads

EXPOSE 3001

# Startup script: seed then run
CMD ["sh", "-c", "node seeds/seed.js && node server.js"]
