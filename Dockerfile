FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
COPY . /app
RUN corepack enable
WORKDIR /app
RUN pnpm install -g http-server

# All deps stage
FROM base AS deps
ADD package.json package-lock.json ./

# Production only deps stage
FROM base AS production-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

# Build stage
FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

FROM base
ENV NODE_ENV=production
COPY --from=production-deps /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist
EXPOSE 4173
CMD [ "http-server", "dist", "-p", "4173" ]
