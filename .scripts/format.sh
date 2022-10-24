#!/bin/bash

set -e 

cd ./frontend 
npm run pre-commit

cd ../backend
poetry run black -l 80 .
