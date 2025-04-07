FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install
RUN npm install -g serve

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Set Node.js memory limit and disable file watching
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV CHOKIDAR_USEPOLLING=false
ENV FAST_REFRESH=false

# Build and start the application in production mode
CMD ["sh", "-c", "npm run build && npm run start:prod"] 