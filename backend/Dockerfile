FROM node:20-alpine AS base

# Build stage
FROM base AS builder
WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Prune dev dependencies
RUN npm prune --production

# Runtime stage
FROM base AS runner
WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 hono

# Copy built artifacts and production dependencies
COPY --from=builder --chown=hono:nodejs /app/dist ./dist
COPY --from=builder --chown=hono:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=hono:nodejs /app/package.json ./package.json

# Switch to non-root user
USER hono

# Add debug prints
RUN echo "Backend Environment at build time:"
RUN echo "PORT=${PORT}"
RUN echo "FRONTEND_URL=${FRONTEND_URL}"

# Add runtime debug script
COPY --chown=hono:nodejs <<'EOF' /app/start.sh
#!/bin/sh
echo "Backend Environment at runtime:"
echo "PORT=${PORT}"
echo "Starting server..."
exec node dist/server.js
EOF

RUN chmod +x /app/start.sh

# Expose the port the app runs on
EXPOSE 3000

# Start using our debug script
CMD ["/app/start.sh"]
