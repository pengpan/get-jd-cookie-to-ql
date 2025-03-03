FROM ghcr.io/puppeteer/puppeteer:24

WORKDIR /app

COPY package*.json ./

USER root

RUN npm install

USER pptruser

COPY . .

CMD ["node", "index.js"]
