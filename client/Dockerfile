# BUILD stage
FROM node:20-alpine AS builder
WORKDIR /app
# Copy package files
COPY package*.json ./
COPY package-lock.json* ./
# Install dependencies
RUN npm ci
# Copy source code
COPY . .
# Build the app
RUN npm run build

# PRODUCTION stage
FROM node:20-alpine AS production
WORKDIR /app
# Install serve to serve static files
RUN npm install -g serve
# Copy built files from builder stage
COPY --from=builder /app/dist ./dist
# Expose port
EXPOSE 5173
# Serve the built app
CMD ["serve", "-s", "dist", "-l", "5173"]