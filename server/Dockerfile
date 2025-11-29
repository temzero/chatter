# --- BUILD STAGE ---
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy tsconfig files BEFORE building
COPY tsconfig*.json ./

# Install dependencies
RUN npm ci

# Copy the entire project
COPY . .

# Build the NestJS app (now it has tsconfig settings!)
RUN npm run build

# --- PRODUCTION STAGE ---
FROM node:20-alpine AS production
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY package-lock.json* ./

# Install production dependencies
RUN npm ci --omit=dev

# Install tsconfig-paths for runtime
RUN npm install tsconfig-paths

# Copy built dist folder
COPY --from=builder /app/dist ./dist

# Copy tsconfig files for runtime resolution
COPY --from=builder /app/tsconfig*.json ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001
RUN chown -R nestjs:nodejs /app
USER nestjs

EXPOSE 10000

CMD ["node", "-r", "tsconfig-paths/register", "dist/main.js"]