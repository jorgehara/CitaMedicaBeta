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

RUN pnpm build

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

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/bot_sessions ./bot_sessions

RUN mkdir -p /app/bot_sessions && \
    chmod -R 777 /app/bot_sessions

ENV PORT=3008
ENV NODE_ENV=production
EXPOSE ${PORT}

CMD ["pnpm", "start"]