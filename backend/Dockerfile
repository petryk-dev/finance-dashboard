# ---- Base ----
FROM node:20-slim AS base
WORKDIR /app

# OpenSSL is required for Prisma to detect libssl and select the correct engine
RUN apt-get update -y && apt-get install -y openssl

# ---- Dependencies ----
FROM base AS deps
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm ci

# ---- Build ----
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# ---- Production ----
FROM base AS production
ENV NODE_ENV=production

RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

# Install deps and generate the Prisma client as root, so it can write to
# node_modules/@prisma/engines before ownership is handed to the non-root user
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm ci --omit=dev && npx prisma generate

COPY --from=build /app/dist ./dist

RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 4000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/app.js"]
