#!/bin/bash

set -e 

cd ./exporter

docker-compose up --build db backend minio &

poetry run uvicorn app:app --reload --port 8002

kill -s SIGINT $(jobs -p)

wait
