# Local-dev image for the BanyanBoard API. Runs TypeScript directly via tsx —
# a production multi-stage build is deferred (out of scope for the scaffold).
FROM node:20-alpine

WORKDIR /app

# Install dependencies first for better layer caching.
COPY package.json package-lock.json ./
RUN npm ci

# Copy source (dist/ and node_modules excluded via .dockerignore).
COPY . .

EXPOSE 3000

CMD ["npx", "tsx", "src/server.ts"]
