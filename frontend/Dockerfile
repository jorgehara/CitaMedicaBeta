# Frontend Dockerfile (asume Vite/React)
FROM node:20 as build

WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm install -D @types/axios
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]