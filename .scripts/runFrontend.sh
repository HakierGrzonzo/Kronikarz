#!/bin/bash

set -e 

cd ./frontend

docker-compose up --build db backend &

npm run dev

kill -s SIGINT $(jobs -p)

wait
