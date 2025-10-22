# Frontend Production Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy shared types
COPY ../shared ../shared
WORKDIR /app/shared
RUN npm install && npm run build

# Build frontend
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

