FROM node:20-alpine AS builder

WORKDIR /app

COPY . .

RUN npm install

RUN npm run build --workspace=theseus-cwl-validator

FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache python3 py3-pip
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --upgrade pip
RUN pip install cwltool

COPY --from=builder /app/apps/theseus-cwl-validator/dist ./dist

COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3003

CMD ["node", "dist/server.js"]