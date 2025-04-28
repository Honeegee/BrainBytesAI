FROM node:18-alpine

WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy app source
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Add error handling for node process
CMD ["sh", "-c", "node server.js || (echo 'Node process crashed' && exit 1)"]
