#!/bin/bash
while !</dev/tcp/backend/80; do 
    sleep 1
done
echo "Backend is up!"
poetry run uvicorn app:app --host 0.0.0.0 --port 80 --proxy-headers
