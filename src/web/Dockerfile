# Build stage
FROM node:15-alpine as build

RUN mkdir /app

WORKDIR /app

COPY package.json /app

RUN yarn install

COPY . /app

RUN yarn build

# Run stage
FROM nginx:1.17.1-alpine

COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx config
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]