# Multi-stage Dockerfile for Fastify API
FROM node:22-alpine AS builder

WORKDIR /app

# Copy root and package configurations
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/package.json

# Install dependencies
RUN npm ci

# Copy only the API source required for compilation. Database tooling is not
# needed by the API process and must not enter either image stage.
COPY apps/api ./apps/api

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

# Copy only the compiled API into the runtime image.
COPY --from=builder /app/apps/api/dist ./apps/api/dist

EXPOSE 3001

CMD ["node", "apps/api/dist/server.js"]
