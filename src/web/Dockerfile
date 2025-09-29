FROM node:24.9.0-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g corepack@0.31
RUN corepack enable
WORKDIR /app

FROM base AS deps
# Copy package files first for better caching
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

FROM base AS prod-deps
# Copy package files first for better caching
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM deps AS build

# Setup build args
ARG VITE_APP_AUTH0_DOMAIN
ARG VITE_APP_AUTH0_CLIENT_ID
ARG VITE_API_BASE_URL

# Set environment variables for the build
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Copy source code after dependencies are installed
COPY . .
RUN pnpm run build

FROM base AS development
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist
EXPOSE 8000
CMD [ "pnpm", "start" ]

# Run stage
FROM nginx:1.29-alpine

COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]