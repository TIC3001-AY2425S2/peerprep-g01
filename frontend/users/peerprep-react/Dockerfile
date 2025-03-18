FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

EXPOSE 2999

# Start in development mode
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"] 