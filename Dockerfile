FROM ghcr.io/puppeteer/puppeteer:24

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["node", "index.js"]
