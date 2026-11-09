# syntax=docker/dockerfile:1

FROM node:22-alpine AS frontend
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY index.html tsconfig.json vite.config.ts ./
COPY src ./src
RUN npm run build

FROM rust:1-bookworm AS backend
RUN apt-get update \
    && apt-get install -y --no-install-recommends pkg-config libssl-dev \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app/esport_api
COPY esport_api/Cargo.toml esport_api/Cargo.lock ./
COPY esport_api/src ./src
COPY esport_api/migrations ./migrations
RUN cargo build --release --locked

FROM debian:bookworm-slim AS runtime
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates libssl3 \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app/esport_api
COPY --from=backend /app/esport_api/target/release/esport_api ./esport_api
COPY --from=frontend /app/dist /app/dist
ENV DIST_DIR=/app/dist \
    RUST_LOG=info
EXPOSE 8080
CMD ["./esport_api"]
