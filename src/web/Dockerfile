# Build stage
FROM node:18-alpine as build

RUN corepack enable
RUN corepack prepare pnpm@latest --activate

RUN mkdir /app

WORKDIR /app

COPY package.json pnpm-lock.yaml .npmrc /app/

RUN pnpm install

COPY . /app

# Setup build args
ARG REACT_APP_AUTH0_DOMAIN
ARG REACT_APP_AUTH0_CLIENT_ID

# Build the application
RUN pnpm build

# Run stage
FROM nginx:1.24-alpine

COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx config
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]