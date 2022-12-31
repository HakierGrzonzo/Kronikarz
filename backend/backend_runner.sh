#!/bin/bash
while !</dev/tcp/db/8000; do 
    sleep 1
done
echo "DB is up!"
while !</dev/tcp/minio/9000; do 
    sleep 1
done
echo "MinIO is up!"
poetry run uvicorn app:app --host 0.0.0.0 --port 80 --proxy-headers
