# Unified Dockerfile for API and Worker (dev & prod)
FROM node:18-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache libc6-compat openssl postgresql-client netcat-openbsd

# Copy package files and install all dependencies
COPY package.json package-lock.json* ./
RUN yarn install

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application (move this here)
RUN yarn build

# Expose port
EXPOSE 8080

# Set environment
ENV PORT=8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Entrypoint script to choose mode (api or worker, dev or prod)
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
ENTRYPOINT ["docker-entrypoint.sh"]