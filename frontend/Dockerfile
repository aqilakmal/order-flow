FROM node:20-alpine AS builder
WORKDIR /app

# Add build arg
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Print build-time variables
RUN echo "Frontend Environment at build time:"
RUN echo "VITE_API_URL=${VITE_API_URL}"

# Install build dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine

# Print runtime variables
RUN echo "Frontend Environment at runtime:"
RUN echo "VITE_API_URL=${VITE_API_URL}"

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Add runtime debug script
COPY <<'EOF' /docker-entrypoint.d/40-debug-env.sh
#!/bin/sh
echo "Frontend Environment before nginx starts:"
echo "VITE_API_URL=${VITE_API_URL}"
EOF

RUN chmod +x /docker-entrypoint.d/40-debug-env.sh

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 