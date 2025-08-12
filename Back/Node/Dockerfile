# ---- Base runtime ----
FROM node:20-slim AS base
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update && apt-get install -y --no-install-recommends tini \
  && rm -rf /var/lib/apt/lists/*
ENTRYPOINT ["/usr/bin/tini","--"]

# ---- Builder (instala deps + compila TS) ----
FROM node:20-slim AS builder
WORKDIR /app
# toolchain para módulos nativos (sqlite3); si no lo necesitas, quítalo
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run build
RUN npm prune --omit=dev

# ---- Imagen final ----
FROM base AS prod
WORKDIR /app
USER node
ENV NODE_ENV=production

COPY --chown=node:node package*.json ./
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist ./dist

EXPOSE 45766

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://localhost:'+(process.env.PORT||45766)+'/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

CMD ["node","dist/server.js"]
