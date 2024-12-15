FROM node:20-alpine AS base

# Build stage
FROM base AS builder
WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# Runtime stage
FROM base AS runner
WORKDIR /app

# Install serve to run the production build
RUN npm install -g serve

# Copy built artifacts from builder
COPY --from=builder /app/dist ./dist

# Expose the port Vite uses
EXPOSE 5173

# Start the application
CMD ["serve", "-s", "dist", "-l", "5173"] 