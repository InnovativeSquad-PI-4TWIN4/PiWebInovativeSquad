# Stage 1: Build the React app
FROM node:18 AS build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY Frontend/package*.json ./

# Install frontend dependencies
RUN npm install

# Copy the rest of the application code
COPY Frontend/ ./

# Build the React
