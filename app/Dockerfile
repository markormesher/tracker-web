FROM node:carbon

WORKDIR /usr/src/app

# dependencies
COPY package.json ./
RUN npm i
RUN git clone https://github.com/vishnubob/wait-for-it.git

# source code
COPY . .

# compile
RUN node ./node_modules/gulp/bin/gulp.js

# run
EXPOSE 3000
CMD ["node", "./dist/app.js"]
