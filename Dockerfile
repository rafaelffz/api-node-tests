FROM node:22-alpine AS builder

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build


FROM node:22-alpine AS production

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY --from=builder /app/dist ./dist

COPY --from=builder /app/drizzle.config.ts ./
COPY --from=builder /app/src/database/migrations ./src/database/migrations

EXPOSE 3333

CMD ["node", "dist/server.js"]