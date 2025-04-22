FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

EXPOSE 3002

# Start the application with seeding
ENTRYPOINT ["/bin/sh", "-c", "node scripts/seed.js && npm start"] 