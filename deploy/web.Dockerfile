FROM node:26.10.0-bookworm-slim@sha256:3ffc19ea878019d9e9ae8971732ad4a03cda44f167107173174b60ed7c65bed3
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/mobile/package.json ./apps/mobile/
RUN npm ci --workspace=@cigana/mobile --include-workspace-root=false
COPY apps/mobile ./apps/mobile
ARG EXPO_PUBLIC_API_URL
ENV EXPO_PUBLIC_API_URL=$EXPO_PUBLIC_API_URL
ENV EXPO_PUBLIC_REQUIRE_BETA_INVITE=1
ENV EXPO_NO_TELEMETRY=1
RUN npm run build:web && mv apps/mobile/dist /web
