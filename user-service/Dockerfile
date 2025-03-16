# Build stage
FROM node:20 AS builder

# Create app directory
WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Production stage
FROM node:20-slim

# Install build dependencies
RUN apt-get update && apt-get install -y python3 make g++

WORKDIR /app

# Copy built node_modules and app files
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app .

# Rebuild bcrypt
RUN npm rebuild bcrypt --build-from-source

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "start"] 