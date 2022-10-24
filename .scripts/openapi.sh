#!/bin/bash

set -e

cd ./backend 
poetry run python -m app ../frontend/openapi.json

cd ../frontend
npm run openprod 

rm openapi.json

