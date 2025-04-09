# Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Add build dependencies
RUN apk add --no-cache python3 make g++ libc6-compat

# Copy package files
COPY package*.json ./

# Install dependencies with specific flags for optimization
RUN npm ci --only=production --legacy-peer-deps

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install serve to run the production build
RUN npm install -g serve

# Copy the built application
COPY --from=builder /app/build ./build

# Expose port
EXPOSE 3000

# Start the application in production mode
CMD ["serve", "-s", "build", "-l", "3000"] 