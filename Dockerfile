FROM mhart/alpine-node:14 as builder
WORKDIR /tmp
COPY . .

RUN npm install --no-progress --loglevel=error --unsafe-perm && npm run build \
	&& wget -q -O - https://gobinaries.com/tj/node-prune | sh \
	&& node-prune . \
	&& npm install --no-progress --production --loglevel=error --production=true --unsafe-perm

FROM alpine:3.14
WORKDIR /app/server
RUN apk add --no-cache nodejs
COPY --from=builder /tmp/server .
ARG API_URL
ARG AUTO_DETECT_BASE_URL
EXPOSE 3000
ENV NODE_ENV=production
ENV API_URL=${API_URL}
CMD [ "node", "index.js" ]
