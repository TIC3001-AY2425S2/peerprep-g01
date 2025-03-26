# Build stage
FROM node:20 AS builder

# Create app directory
WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y python3 make g++ netcat-openbsd

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Production stage
FROM node:20-slim

# Install build dependencies
RUN apt-get update && apt-get install -y python3 make g++ netcat-openbsd

WORKDIR /app

# Copy built node_modules and app files
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app .

# Make seed script executable
RUN chmod +x scripts/wait-and-seed.sh

# Rebuild bcrypt
RUN npm rebuild bcrypt --build-from-source

# Expose port
EXPOSE 3002

# Start the application with seeding
CMD ["./scripts/wait-and-seed.sh"] 