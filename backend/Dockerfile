# Backend Dockerfile
FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

COPY . .

ENV PORT=3001
EXPOSE 3001

CMD [ "npm", "start" ]