FROM node:20-alpine

WORKDIR /app

# Install netcat for the wait script
RUN apk add --no-cache netcat-openbsd

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code and wait script
COPY . .
COPY wait-for-rabbitmq.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/wait-for-rabbitmq.sh

EXPOSE 3004
#EXPOSE 3005

# Use wait script as entrypoint
ENTRYPOINT ["/usr/local/bin/wait-for-rabbitmq.sh", "rabbitmq", "npm", "start"] 