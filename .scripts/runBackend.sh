#!/bin/bash

set -e 

cd ./backend

docker-compose up --build db &

poetry run uvicorn app:app --reload

kill -s SIGINT $(jobs -p)

wait
