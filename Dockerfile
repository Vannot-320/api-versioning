# ── Build Stage ───────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les manifestes en premier pour profiter du cache Docker
COPY package*.json ./
RUN npm ci --only=production

# ── Production Stage ──────────────────────────────────────────────────────────
FROM node:20-alpine AS production

# Sécurité : utilisateur non-root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copier les dépendances du build stage
COPY --from=builder /app/node_modules ./node_modules
COPY --chown=appuser:appgroup src/ ./src/
COPY --chown=appuser:appgroup package.json ./

USER appuser

EXPOSE 3000

# Healthcheck intégré
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "src/server.js"]
