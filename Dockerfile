# Multi-stage build for WhatsApp Bot TypeScript
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++ cairo-dev jpeg-dev pango-dev giflib-dev

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Install runtime dependencies
RUN apk add --no-cache \
    chromium \
    postgresql-client \
    curl \
    ca-certificates \
    dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S appuser -u 1001 -G nodejs

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Copy database files
COPY --chown=appuser:nodejs src/database/migrations ./src/database/migrations
COPY --chown=appuser:nodejs src/database/seeders ./src/database/seeders
COPY --chown=appuser:nodejs src/database/config ./src/database/config

# Copy deployment scripts
COPY --chown=appuser:nodejs scripts ./scripts

# Create necessary directories
RUN mkdir -p logs data && \
    chown -R appuser:nodejs /app

# Set Puppeteer to use system chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Set Node environment
ENV NODE_ENV=production
ENV PORT=3000

# Switch to non-root user
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD npm run health || exit 1

# Expose port
EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application with deployment script
CMD ["sh", "./scripts/deploy.sh"]
