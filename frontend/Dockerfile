FROM node:18-alpine

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy app source
COPY . .

EXPOSE 3000

# Start Next.js in development mode
CMD ["npm", "run", "dev"]
