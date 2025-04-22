FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

EXPOSE 3003

# Use wait script as entrypoint
ENTRYPOINT ["/bin/sh", "-c", "npm start"] 