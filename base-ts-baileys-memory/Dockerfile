# Etapa de desarrollo
FROM node:21-alpine3.18 as development

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate
ENV PNPM_HOME=/usr/local/bin

COPY package*.json pnpm-lock.yaml ./

RUN apk add --no-cache --virtual .gyp \
    python3 \
    make \
    g++ \
    git \
    && pnpm install \
    && apk del .gyp

COPY . .

RUN mkdir -p /app/bot_sessions && \
    chmod -R 777 /app/bot_sessions

ENV PORT=3008
EXPOSE ${PORT}

CMD ["pnpm", "dev"]

# Etapa de construcción
FROM node:21-alpine3.18 as builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate
ENV PNPM_HOME=/usr/local/bin

COPY package*.json pnpm-lock.yaml ./

RUN apk add --no-cache --virtual .gyp \
    python3 \
    make \
    g++ \
    git \
    && pnpm install \
    && apk del .gyp

COPY . .

RUN pnpm run build

# Etapa de producción
FROM node:21-alpine3.18 as production

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate
ENV PNPM_HOME=/usr/local/bin

# Crear directorios y usuarios
RUN mkdir -p /app/bot_sessions && \
    addgroup -g 1001 -S nodejs && \
    adduser -S -u 1001 nodejs && \
    chown -R nodejs:nodejs /app && \
    chown -R nodejs:nodejs /app/bot_sessions && \
    chmod -R 755 /app && \
    chmod -R 755 /app/bot_sessions

# Copiar archivos desde builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json /app/pnpm-lock.yaml ./

RUN pnpm install --prod --ignore-scripts \
    && chown -R nodejs:nodejs /app \
    && rm -rf $PNPM_HOME/.npm $PNPM_HOME/.node-gyp

# Agregar wait-for-it
COPY wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

USER nodejs

ARG PORT=3008
ENV PORT=${PORT}
EXPOSE ${PORT}

# Esperar a Mongo antes de iniciar
CMD ["/wait-for-it.sh", "mongo:27017", "--", "pnpm", "start"]