# Multi-stage Dockerfile for Fastify API
FROM node:22-alpine AS builder

WORKDIR /app

# Copy root and package configurations
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/package.json

# Install dependencies
RUN npm ci

# Copy source files
COPY apps/api ./apps/api
COPY database ./database

# Build Fastify TypeScript project
RUN npm run build:api

# Production Stage
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV API_HOST=0.0.0.0
ENV API_PORT=3001

# Copy package files and install production dependencies only
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/package.json
RUN npm ci --omit=dev

# Copy built dist files and database scripts
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/database ./database

EXPOSE 3001

CMD ["node", "apps/api/dist/server.js"]
