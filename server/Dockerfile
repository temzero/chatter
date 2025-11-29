# --- BUILD STAGE ---
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files (cached layer if unchanged)
COPY package*.json ./
COPY tsconfig*.json ./

# Install all dependencies
RUN npm ci

# Copy source code
COPY . .

# Build
RUN npm run build

# --- PRODUCTION STAGE ---
FROM node:20-alpine AS production
WORKDIR /app

# Create non-root user FIRST
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 -G nodejs

# Copy package files with ownership
COPY --chown=nestjs:nodejs package*.json ./

# Install production dependencies + tsconfig-paths
RUN npm ci --omit=dev && \
    npm install --no-save tsconfig-paths && \
    npm cache clean --force

# Copy built files with correct ownership (no chown needed!)
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/tsconfig.json ./

# Switch to non-root user
USER nestjs

EXPOSE 10000

CMD ["node", "-r", "tsconfig-paths/register", "dist/main.js"]