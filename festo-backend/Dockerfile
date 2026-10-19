FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY src/ ./src/
COPY tsconfig.json ./tsconfig.json
COPY migrations/ ./migrations/
COPY seed.js ./seed.js
RUN npm run build

EXPOSE 5000

CMD ["npm", "run", "start:api"]
