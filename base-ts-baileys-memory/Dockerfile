FROM node:21-alpine3.18

WORKDIR /app

# Instalar dependencias del sistema y configurar pnpm
RUN apk add --no-cache --virtual .gyp \
        python3 \
        make \
        g++ \
    && apk add --no-cache git \
    && corepack enable \
    && corepack prepare pnpm@latest --activate

ENV PNPM_HOME=/usr/local/bin
ENV PORT=3009
ENV NODE_ENV=development

# Copiar archivos de configuración
COPY package*.json pnpm-lock.yaml ./
COPY tsconfig.json rollup.config.js nodemon.json ./

# Instalar dependencias
RUN pnpm install

# Copiar el código fuente
COPY . .

# Crear directorios necesarios y configurar permisos
RUN mkdir -p /app/bot_sessions /app/bot_data \
    && chmod -R 777 /app/bot_sessions /app/bot_data \
    && npm cache clean --force \
    && addgroup -g 1001 -S nodejs \
    && adduser -S -u 1001 nodejs -G nodejs \
    && chown -R nodejs:nodejs /app \
    && apk del .gyp

USER nodejs

EXPOSE ${PORT}

CMD ["pnpm", "start"]