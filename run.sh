#!/bin/sh
#
EXTPORT=8080
IMG=pontino/shared-timer
TAG=0.01

! [ -f ./db.json ] && \
	echo -e "\n ==> Before running the container, you need to create first a db.json file\n ==> See: https://github.com/pontino/shared-timer/blob/master/server/data/db.json.example\n" && exit 1; 

docker container run --name timer \
	--mount type=bind,source="$(pwd)"/db.json,target=/app/server/data/db.json \
	-e NODE_ENV=production \
	-p ${EXTPORT}:3000 ${IMG}:${TAG}
