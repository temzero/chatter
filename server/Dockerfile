# --- BUILD STAGE ---
FROM node:20-alpine AS builder
WORKDIR /app

# Copy and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the entire project
COPY . .

# Build the NestJS app
RUN npm run build


# --- PRODUCTION STAGE ---
FROM node:20-alpine AS production
WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built dist folder
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001
RUN chown -R nestjs:nodejs /app
USER nestjs

# Render provides dynamic port
EXPOSE 8000

CMD ["node", "dist/main.js"]
