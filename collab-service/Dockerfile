FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

EXPOSE 3004
#EXPOSE 3005

# Use wait script as entrypoint
ENTRYPOINT ["npm", "start"] 