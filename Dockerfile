FROM oven/bun:1.4.0-alpine AS build
WORKDIR /repo

COPY bun.lock package.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/admin-contracts/package.json packages/admin-contracts/package.json
COPY packages/typescript-config/package.json packages/typescript-config/package.json

RUN bun install --frozen-lockfile --linker isolated --filter api

COPY packages/db packages/db
COPY packages/admin-contracts packages/admin-contracts
COPY apps/api apps/api

WORKDIR /repo/apps/api
RUN NODE_ENV=production bun run build

FROM oven/bun:1.4.0-alpine AS runtime
WORKDIR /app/apps/api

ENV NODE_ENV=production
ENV PARTICIPANTS_DB_PATH=/app/apps/api/data/participants.db

COPY --from=build /repo/apps/api/dist ./dist

EXPOSE 3000

CMD ["bun", "dist/index.js"]
