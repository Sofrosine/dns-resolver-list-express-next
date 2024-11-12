# Use the official Node.js 18.20 image as the base image
FROM node:18.20

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files
COPY package.json package-lock.json ./

# Install the dependencies
RUN npm install

# Install dnsutils to provide the dig command
RUN apt-get update && apt-get install -y dnsutils

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["node", "./app.js"]
