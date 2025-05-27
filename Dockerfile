# Multi-stage build for production optimization
FROM node:18-alpine AS builder

# Install build dependencies
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    wget \
    python3 \
    make \
    g++

# Set working directory
WORKDIR /app

# Set Puppeteer to use installed Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev dependencies for building)
RUN npm ci --include=dev && npm cache clean --force

# Copy TypeScript config and source code
COPY tsconfig.json ./
COPY src/ ./src/

# Ensure TypeScript is available and build
RUN npx tsc --version && npm run build

# Verify build output exists
RUN ls -la dist/ && test -f dist/index.js

# Production stage
FROM node:18-alpine AS production

# Declare build arguments
ARG DB_HOST
ARG DB_PORT
ARG DB_NAME
ARG DB_USER
ARG DB_PASSWORD
ARG BOT_NAME
ARG OWNER_NUMBER
ARG N8N_WEBHOOK_URL
ARG N8N_API_KEY
ARG DAILY_LIMIT_FREE
ARG DAILY_LIMIT_PREMIUM
ARG DAILY_LIMIT_ADMIN
ARG APP_PORT
ARG NODE_ENV
ARG REDIS_HOST
ARG REDIS_PORT
ARG REDIS_PASSWORD
ARG TIMEZONE
ARG LOG_LEVEL
ARG LOG_FILE_MAX_SIZE
ARG LOG_FILE_MAX_FILES
ARG SESSION_SECRET
ARG JWT_SECRET

# Install system dependencies for runtime
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    wget \
    dumb-init

# Create app user for security
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# Set working directory
WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Set Puppeteer to use installed Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser \
    NODE_ENV=production

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Create necessary directories first
RUN mkdir -p /app/logs /app/_IGNORE_dmr-bot

# Set permissions for the app user
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 3000

# Health check using a simple node command
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "process.exit(0)" || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["npm", "start"]
