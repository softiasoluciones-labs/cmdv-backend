# ==================================
# 🏗️ Stage 1: Build Stage
# ==================================
FROM node:20-alpine AS builder

# Install necessary build tools
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the TypeScript application
RUN npm run build

# ==================================
# 🚀 Stage 2: Production Stage
# ==================================
FROM node:20-alpine AS runner

# Install security updates
RUN apk add --no-cache libc6-compat && \
    apk upgrade --no-cache

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 expressjs

# Copy package files
COPY package.json package-lock.json* ./

# Install only production dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Create logs directory and set permissions
RUN mkdir -p logs && chown -R expressjs:nodejs logs

# Change ownership of the app directory
RUN chown -R expressjs:nodejs /app

# Switch to non-root user
USER expressjs

# Expose the API port
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3002/health || exit 1

# Start the application
CMD ["node", "dist/server.js"]
