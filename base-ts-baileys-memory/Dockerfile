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

# Crear directorios necesarios y establecer permisos
RUN mkdir -p /app/bot_sessions && \
    addgroup -g 1001 -S nodejs && \
    adduser -S -u 1001 nodejs && \
    chown -R nodejs:nodejs /app && \
    chown -R nodejs:nodejs /app/bot_sessions && \
    chmod -R 755 /app && \
    chmod -R 755 /app/bot_sessions

RUN corepack enable && corepack prepare pnpm@latest --activate
ENV PNPM_HOME=/usr/local/bin

COPY --from=builder /app/dist ./dist
# Si en el futuro usas assets, descomenta la línea siguiente:
# COPY --from=builder /app/assets ./assets
COPY --from=builder /app/package*.json /app/pnpm-lock.yaml ./

RUN pnpm install --prod --ignore-scripts \
    && addgroup -g 1001 -S nodejs \
    && adduser -S -u 1001 nodejs \
    && chown -R nodejs:nodejs /app \
    && rm -rf $PNPM_HOME/.npm $PNPM_HOME/.node-gyp

USER nodejs

ARG PORT=3008
ENV PORT=${PORT}
EXPOSE ${PORT}

CMD ["pnpm", "start"]