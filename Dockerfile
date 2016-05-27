FROM node:argon

ENV NODE_ENV production

RUN mkdir -p /app
WORKDIR /app
COPY . /app
RUN npm install
RUN ./node_modules/grunt-cli/bin/grunt scss

EXPOSE 3000

VOLUME /app

CMD [ "npm", "start" ]
