FROM node:20-alpine AS builder

WORKDIR /app

COPY . .

RUN npm install

RUN npm run build --workspace=theseus-cwl-ide

FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /app/apps/theseus-cwl-ide/dist /usr/share/nginx/html

COPY apps/theseus-cwl-ide/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3002

CMD ["nginx", "-g", "daemon off;"]