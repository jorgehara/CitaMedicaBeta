# Etapa de construcción
FROM node:18-alpine as builder

WORKDIR /app

COPY package*.json ./

# Instalar dependencias y limpiar caché en la misma capa
RUN npm install --production && \
    npm cache clean --force

# Etapa de producción
FROM node:18-alpine

WORKDIR /app

# Copiar solo los archivos necesarios
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
COPY wait-for-it.sh /wait-for-it.sh
COPY . .

RUN chmod +x /wait-for-it.sh && \
    rm -rf /root/.npm

ENV PORT=3001
ENV NODE_ENV=production
EXPOSE 3001

# Esperar a MongoDB antes de iniciar
CMD ["/wait-for-it.sh", "mongodb:27017", "--strict", "--timeout=60", "--", "npm", "start"]