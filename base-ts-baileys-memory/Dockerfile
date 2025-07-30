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
    bash \
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
    bash \
    && pnpm install \
    && apk del .gyp

COPY . .

# Asegurarse de que los directorios existen
RUN mkdir -p dist bot_sessions

# Construir el proyecto
RUN pnpm build

# Verificar que el archivo se construyó
RUN test -f dist/app.js || exit 1

# Etapa de producción
FROM node:21-alpine3.18 as production

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate
ENV PNPM_HOME=/usr/local/bin

COPY package*.json pnpm-lock.yaml ./

RUN apk add --no-cache --virtual .gyp \
    python3 \
    make \
    g++ \
    git \
    bash \
    && pnpm install --prod \
    && apk del .gyp

# Copiar los archivos construidos y asegurarse de que existan
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src ./src

# Crear directorios necesarios y establecer permisos
RUN mkdir -p /app/bot_sessions /app/bot_data && \
    chmod -R 777 /app/bot_sessions /app/bot_data && \
    ls -la /app/dist && \
    echo "Contenido de /app/dist:" && \
    ls -la /app/dist

ENV PORT=3008
ENV NODE_ENV=production
EXPOSE ${PORT}

# Cambiar el comando para usar ts-node en producción
CMD ["pnpm", "start"]