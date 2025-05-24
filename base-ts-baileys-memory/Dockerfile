# Etapa de desarrollo
FROM node:21-alpine3.18 as development

WORKDIR /app

# Habilitar pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate
ENV PNPM_HOME=/usr/local/bin

# Copiar archivos de configuración
COPY package*.json pnpm-lock.yaml ./

# Instalar dependencias de desarrollo
RUN apk add --no-cache --virtual .gyp \
    python3 \
    make \
    g++ \
    git \
    && pnpm install \
    && apk del .gyp

# Copiar el código fuente
COPY . .

# Puerto por defecto para desarrollo
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

# Copiar solo los archivos necesarios desde la etapa de construcción
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/assets ./assets
COPY --from=builder /app/package*.json /app/pnpm-lock.yaml ./

# Instalar solo dependencias de producción
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