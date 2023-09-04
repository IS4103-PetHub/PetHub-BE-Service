# Use the official Node.js image as a base image
# 'slim' variant is a smaller-sized image that contains the minimal packages required to run Node.js.
FROM --platform=linux/amd64 node:18-slim

# Set the working directory in the Docker container
WORKDIR /usr/src/app

# Install required system libraries
RUN apt-get update && apt-get install -y openssl libssl-dev && apt-get clean

# Copy package.json and package-lock.json files
COPY package*.json ./

# Install Node.js packages
RUN npm install

# copy the rest of the application to the container
COPY . .

# consolidate all modifications across prisma files and automatically generate a new schema.prisma
RUN npx prisma-multischema

# Create and apply database migrations in your Prisma prisma/migrations
RUN npx prisma migrate dev

# Generate the Prisma Client
RUN npx prisma generate

# Expose the port to get access
EXPOSE 3000

# Start application on the container
CMD ["node", "src/app.js"]