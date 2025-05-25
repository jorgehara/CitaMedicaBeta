FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install -g pnpm && pnpm install

COPY . .

EXPOSE 3008

CMD ["pnpm", "start"]