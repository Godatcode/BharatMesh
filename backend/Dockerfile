# Backend Dockerfile for Render
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy shared types first
COPY shared ./shared

# Copy backend source
COPY . .

# Install all dependencies (including dev dependencies for build)
RUN npm install

# Build TypeScript
RUN npm run build

# Remove dev dependencies after build
RUN npm prune --omit=dev

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Create necessary directories
RUN mkdir -p logs uploads && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 5000 6000

CMD ["node", "dist/server.js"]