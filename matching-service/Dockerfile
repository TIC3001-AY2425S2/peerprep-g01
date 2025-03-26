FROM node:20-alpine

WORKDIR /app

# Install netcat for health check
RUN apk add --no-cache netcat-openbsd

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code and wait script
COPY . .
COPY wait-for-rabbitmq.sh /wait-for-rabbitmq.sh
RUN chmod +x /wait-for-rabbitmq.sh

EXPOSE 3003

# Use wait script as entrypoint
ENTRYPOINT ["/wait-for-rabbitmq.sh"]
CMD ["npm", "start"] 