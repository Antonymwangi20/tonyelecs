# Production Dockerfile - builds frontend and runs Node server
FROM node:18-alpine AS build

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install --production=false --silent

# Copy source
COPY . .

# Build client
RUN npm run build

# Production image
FROM node:18-alpine AS runtime
WORKDIR /app

# Copy only necessary files from build stage
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/server ./server
COPY --from=build /app/dist ./dist

ENV NODE_ENV=production
ENV PORT=3001
EXPOSE 3001

CMD ["node", "server/index.js"]
