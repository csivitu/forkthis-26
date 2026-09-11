#Stage 1 build
FROM oven/bun:1.4.0-slim AS deps
WORKDIR /repo

COPY package.json bun.lock bunfig.toml ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/ui/package.json packages/ui/package.json
COPY packages/eslint-config/package.json packages/eslint-config/package.json
COPY packages/typescript-config/package.json packages/typescript-config/package.json

RUN bun install --frozen-lockfile --production

#Stage 2 Run
FROM oven/bun:1.4.0-slim AS runtime
WORKDIR /repo
ENV NODE_ENV=production

COPY --from=deps /repo/node_modules ./node_modules
COPY apps/api apps/api
COPY packages/db packages/db
COPY participants.db participants.db

EXPOSE 3000
WORKDIR /repo/apps/api

CMD ["bun", "run", "src/index.ts"]