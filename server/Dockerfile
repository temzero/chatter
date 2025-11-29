# --- BUILD STAGE ---
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files and install all dependencies
COPY package*.json ./
RUN npm ci

# Copy the entire project
COPY . .

# Build the NestJS app
RUN npm run build

# --- PRODUCTION STAGE ---
FROM node:20-alpine AS production
WORKDIR /app

# Copy package files and install only production dependencies
COPY package*.json ./
COPY package-lock.json* ./
RUN npm ci --only=production

# Copy built dist folder from builder stage
COPY --from=builder /app/dist ./dist

# Copy tsconfig.json for tsconfig-paths
COPY --from=builder /app/tsconfig.json ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001
RUN chown -R nestjs:nodejs /app
USER nestjs

# Expose port (Render uses dynamic PORT)
EXPOSE 8000

# Start the app with tsconfig-paths to handle absolute imports
CMD ["node", "-r", "tsconfig-paths/register", "dist/main.js"]
