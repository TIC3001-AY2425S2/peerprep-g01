FROM node:20-alpine

WORKDIR /app

# Install netcat for health check
RUN apk add --no-cache netcat-openbsd

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

EXPOSE 3003

# Use wait script as entrypoint
#ENTRYPOINT ["/bin/sh", "-c", "while ! nc -z $RABBITMQ_HOST 5672; do echo 'Waiting for RabbitMQ...'; sleep 1; done; echo 'RabbitMQ is ready!'; npm start"] 
ENTRYPOINT ["/bin/sh", "-c", "npm start"] 