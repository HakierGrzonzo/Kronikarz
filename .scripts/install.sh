#!/bin/bash

set -e

cd frontend
npm install --frozen 

cd ../backend
poetry install
