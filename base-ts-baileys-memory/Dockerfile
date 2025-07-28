# Etapa de desarrollo
FROM node:16-alpine3.16 as development

WORKDIR /app

# Instalar dependencias necesarias
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git \
    bash \
    curl

# Instalar pnpm de manera segura
RUN curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm

# Copiar archivos de dependencias
COPY package*.json pnpm-lock.yaml ./

# Instalar dependencias
RUN pnpm install --frozen-lockfile

# Copiar el resto de los archivos
COPY . .

# Crear y configurar el directorio de sesiones
RUN mkdir -p /app/bot_sessions && \
    chmod -R 777 /app/bot_sessions

ENV PORT=3008
EXPOSE ${PORT}

# Comando para desarrollo
CMD ["pnpm", "dev"]

# Etapa de construcción
FROM node:16-alpine3.16 as builder

WORKDIR /app

# Instalar dependencias necesarias y pnpm
RUN apk add --no-cache python3 make g++ git bash curl && \
    curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm

COPY package*.json pnpm-lock.yaml ./

RUN pnpm install

COPY . .

RUN pnpm build

# Etapa de producción
FROM node:16-alpine3.16 as production

WORKDIR /app

# Instalar dependencias necesarias y pnpm
RUN apk add --no-cache python3 make g++ git bash curl && \
    curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm

COPY package*.json pnpm-lock.yaml ./

# Instalar solo dependencias de producción
RUN pnpm install --prod

# Copiar los archivos construidos
COPY --from=builder /app/dist ./dist

# Crear el directorio bot_sessions
RUN mkdir -p /app/bot_sessions && \
    chmod -R 777 /app/bot_sessions

ENV PORT=3008
ENV NODE_ENV=production
EXPOSE ${PORT}

CMD ["node", "dist/app.js"]