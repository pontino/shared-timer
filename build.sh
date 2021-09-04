#!/bin/sh
AUTO_DETECT_BASE_URL=${1:-false}
API_URL=${2}

echo "** Please read the README.md to know which vars are used at build time **"
echo
echo "==> Building image.."

docker build \
	-t pontino/shared-timer:${TAG:-0.01} \
	--build-arg AUTO_DETECT_BASE_URL=${AUTO_DETECT_BASE_URL} \
	--build-arg API_URL=${API_URL} \
	--no-cache .
