# Build Stage
FROM node:22-alpine AS builder

WORKDIR /app

# Enable corepack for pnpm
RUN corepack enable

# Copy root monorepo config
COPY package.json pnpm-workspace.yaml ./

# Copy shared types and client
COPY types ./types
COPY client ./client

# Install dependencies
RUN pnpm install --filter=@nextask/client...

# Build the client
WORKDIR /app/client
RUN pnpm build

# Serve Stage (Using nginx)
FROM nginx:alpine

COPY --from=builder /app/client/dist /usr/share/nginx/html
COPY client/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
