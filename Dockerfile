FROM ghcr.io/puppeteer/puppeteer:24

WORKDIR /app

COPY package*.json ./

USER root

RUN npm install

USER pptruser

COPY . .

RUN npx puppeteer browsers install

CMD ["node", "index.js"]
