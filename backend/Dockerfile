# ==============================================================================
# PAVIRA SIGNATURE - BACKEND DOCKER CONTAINER
# ==============================================================================

# Build Stage
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --only=production

# Production Stage
FROM node:18-alpine

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY . .

EXPOSE 5000

ENV NODE_ENV=production

CMD ["node", "server.js"]
