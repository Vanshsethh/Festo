FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY src/ ./src/
COPY migrations/ ./migrations/
COPY seed.js ./seed.js
COPY .env .env

EXPOSE 5000

CMD ["npm", "run", "start:api"]
