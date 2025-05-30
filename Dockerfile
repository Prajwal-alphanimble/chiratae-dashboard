# Use the official Node.js image as the base image
FROM node:latest

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json ./
COPY package-lock.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run build

# Expose the ports the app and services run on
EXPOSE 3000

# Set environment variables
# ENV NODE_ENV=production
# ENV PORT=3000

# Start the application
CMD ["npm", "run", "start"]
