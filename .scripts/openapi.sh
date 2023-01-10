#!/bin/bash

set -e
ROOT=$(pwd)

cd $ROOT/backend 
poetry run python -m app $ROOT/frontend/openapi.json

rm -r $ROOT/exporter/app/kronikarz_backend_client
cd $ROOT/exporter/app/
poetry run openapi-python-client generate --path $ROOT/frontend/openapi.json --meta none

cd $ROOT/frontend
npm run openprod 

rm openapi.json

