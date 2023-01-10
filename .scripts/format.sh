#!/bin/bash

set -e 

ROOT=$(pwd)

cd $ROOT/frontend 
npm run pre-commit

cd $ROOT/backend
poetry run isort . --profile black
poetry run black -l 80 .

cd $ROOT/exporter
poetry run isort . --profile black
poetry run black -l 80 .
