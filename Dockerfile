# Base image with full Debian and bash
FROM node:18-bullseye

# Create working directory
WORKDIR /usr/src/app

# Copy package files first (better caching)
COPY package*.json ./

# Install dependencies (including dev dependencies for now)
RUN npm install

# Copy all files (changed for production)
COPY . .

# Expose ports (API + debug if needed)
EXPOSE 3000 9229

# Start command (will use nodemon in development)
CMD ["npm", "start"]