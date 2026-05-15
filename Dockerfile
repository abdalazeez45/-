# Stage 1: Build the Angular Application
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Serve the application with Node.js Express server
FROM node:22-alpine

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/server.ts ./
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/package-lock.json ./package-lock.json

# Install production dependencies only (plus ts-node for server.ts if not compiled)
RUN npm ci --only=production
RUN npm install -g tsx

EXPOSE 3000

CMD ["npx", "tsx", "server.ts"]
