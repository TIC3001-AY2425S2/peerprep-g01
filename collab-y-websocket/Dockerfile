FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

EXPOSE 3005

ENV PORT=3005
ENV HOST=0.0.0.0
ENV YPERSISTENCE=./db

ENTRYPOINT ["npx", "y-websocket"] 