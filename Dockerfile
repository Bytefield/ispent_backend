FROM node:14-alpine

WORKDIR /app

COPY package*.json ./

RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh && \
    npm install

RUN npm install mongodb

COPY . .

COPY ./certs /app/certs

EXPOSE 3000

CMD ["npm", "start"]