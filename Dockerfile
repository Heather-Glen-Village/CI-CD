FROM node:18

WORKDIR /app

COPY . .

RUN npm install -g pm2 && npm install

EXPOSE 8085

CMD ["pm2-runtime", "pm2.config.cjs"]
