#!/bin/bash

set -e
ROOT=$(pwd)

cd $ROOT/frontend
npm install --frozen 

cd $ROOT/backend
poetry install

cd $ROOT/exporter
poetry install
