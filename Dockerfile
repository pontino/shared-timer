### STAGE 1: Build ###
FROM mhart/alpine-node:14 as builder

RUN mkdir -p /temp/app
RUN mkdir -p /app

WORKDIR /app

COPY . .

RUN npm i --no-progress --loglevel=error --unsafe-perm

RUN npm run build

RUN rm -rf client/*

RUN cp -R /app/server /temp/app

RUN rm -rf /app/*

RUN cp -R /temp/app /app

RUN rm -rf /temp/app

RUN npm i --no-progress --production --loglevel=error --production=true --unsafe-perm

FROM mhart/alpine-node:14

WORKDIR /app

COPY --from=builder /app/app/server .

RUN apk add --no-cache --quiet curl

RUN curl -sf https://gobinaries.com/tj/node-prune | sh

RUN apk del --no-cache --quiet curl

RUN node-prune .

EXPOSE 3000

CMD node index.js
