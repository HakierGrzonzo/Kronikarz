#!/bin/bash
#while !</dev/tcp/db/5432; do 
#    sleep 1
#done
#echo "DB is up!"
poetry run uvicorn app:app --host 0.0.0.0 --port 80 --proxy-headers
