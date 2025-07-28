# Etapa de construcción
FROM node:18-alpine as builder

WORKDIR /app

# Instalar dependencias y construir en una sola capa
RUN apk add --no-cache python3 make g++ git bash curl && \
    curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm && \
    rm -rf /var/cache/apk/*

COPY package*.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile && \
    pnpm store prune

COPY . .

RUN pnpm build && \
    pnpm prune --prod && \
    rm -rf /root/.cache /root/.npm /root/.pnpm-store

# Etapa de producción
FROM node:18-alpine as production

WORKDIR /app

# Copiar solo los archivos necesarios de la etapa de construcción
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/start.sh ./start.sh

# Crear el directorio bot_sessions y configurar permisos
RUN mkdir -p /app/bot_sessions && \
    chmod -R 777 /app/bot_sessions && \
    chmod +x /app/start.sh && \
    apk add --no-cache bash

ENV PORT=3008
ENV NODE_ENV=production
EXPOSE ${PORT}

ENTRYPOINT ["/app/start.sh"]