# Backend Dockerfile
FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

# Agregar wait-for-it
COPY wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

COPY . .

ENV PORT=3001
EXPOSE 3001

# Esperar a MongoDB antes de iniciar
CMD ["/wait-for-it.sh", "mongodb:27017", "--timeout=300", "--", "npm", "start"]