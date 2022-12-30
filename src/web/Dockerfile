# Build stage
FROM node:18-alpine as build

RUN corepack enable
RUN corepack prepare pnpm@latest --activate

RUN mkdir /app

WORKDIR /app

COPY package.json pnpm-lock.yaml .npmrc /app/

RUN pnpm install

COPY . /app

RUN pnpm build

# Run stage
FROM nginx:1.23.3-alpine

COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx config
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]