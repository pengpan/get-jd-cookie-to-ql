FROM ghcr.io/puppeteer/puppeteer:23

WORKDIR /app

COPY package*.json ./

USER root

RUN npm install

USER pptruser

COPY . .

RUN npx puppeteer browsers install

CMD ["node", "index.js"]
