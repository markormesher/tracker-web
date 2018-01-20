FROM node:carbon

WORKDIR /usr/src/app

COPY package.json ./
COPY . .

RUN npm i -g pm2 gulp
RUN npm i
RUN gulp
RUN git clone https://github.com/vishnubob/wait-for-it.git

EXPOSE 3000

CMD ["pm2-runtime", "./process.local.json"]
