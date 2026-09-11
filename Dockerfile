#Stage 1 build
FROM oven/bun:1.4.0-alpine AS deps
WORKDIR /repo

COPY package.json bun.lock bunfig.toml ./
COPY apps/api/package.json apps/api/package.json
COPY packages packages
RUN bun install --frozen-lockfile --production
RUN rm -rf node_modules/next node_modules/@next node_modules/three node_modules/three-stdlib node_modules/stats-gl node_modules/@react-three node_modules/@mediapipe node_modules/hls.js node_modules/gsap node_modules/react-dom node_modules/react
#Stage 2 Run
FROM oven/bun:1.4.0-alpine AS runtime
WORKDIR /repo

COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/packages ./packages
COPY apps/api apps/api

EXPOSE 3000
WORKDIR /repo/apps/api

CMD ["bun", "run", "src/index.ts"]