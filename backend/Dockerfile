# Backend Dockerfile for Render
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy shared types (if available)
COPY shared ./shared 2>/dev/null || echo "Shared directory not found, continuing..."

# Copy backend source
COPY . .

# Build TypeScript
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Create necessary directories
RUN mkdir -p logs uploads && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 5000 6000

CMD ["node", "dist/server.js"]