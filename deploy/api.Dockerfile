FROM node:26.10.0-bookworm-slim@sha256:3ffc19ea878019d9e9ae8971732ad4a03cda44f167107173174b60ed7c65bed3 AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/mobile/package.json ./apps/mobile/
RUN npm ci --workspace=@cigana/api --include-workspace-root=false
COPY apps/api ./apps/api
RUN npm run build:api && npm prune --omit=dev --workspace=@cigana/api

FROM node:26.10.0-bookworm-slim@sha256:3ffc19ea878019d9e9ae8971732ad4a03cda44f167107173174b60ed7c65bed3
WORKDIR /app
ENV NODE_ENV=production
COPY Modelfile ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api/package.json ./apps/api/
COPY --from=build /app/apps/api/dist ./apps/api/dist/
COPY --from=build /app/apps/api/migrations ./apps/api/migrations/
COPY --from=build /app/apps/api/scripts ./apps/api/scripts/
WORKDIR /app/apps/api
USER node
CMD ["node", "dist/main.js"]
