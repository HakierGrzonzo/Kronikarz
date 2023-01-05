#!/bin/bash

set -e
UNIQ=$(date +%s)

echo "Create user"
FIELD_TEST=$(curl 'http://localhost:8000/api/auth/register' -s -X POST \
  -H 'User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:108.0) Gecko/20100101 Firefox/108.0' \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  --data-raw "{\"email\": \"user$UNIQ@example.com\", \"password\": \"string\", \"is_active\": true, \"is_superuser\": false, \"is_verified\": false}" | jq -r '.field_set_templates[0]')

echo "Login"
TOKEN=$(curl 'http://localhost:8000/api/auth/jwt/login' -s -X POST \
  -H 'Accept: application/json, text/plain, */*' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data-raw "grant_type=password&username=user$UNIQ%40example.com&password=string" | jq -r .access_token)

echo "Create Tree"
TREE=$(curl 'http://localhost:8000/api/trees/new?name=test' -s -X POST \
  -H 'Accept: application/json' \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Length: 0' | jq -r .id )

echo "Create Node"
NODE=$(curl -s -X 'POST' \
  "http://localhost:8000/api/nodes/new/$TREE" \
  -H 'accept: application/json' \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d "{\"$FIELD_TEST\": {\"values\": [\"food\"]}}" | jq -r .id)

echo "Nodes in $TREE"
curl -s -X 'GET' \
  "http://localhost:8000/api/nodes/values/$TREE/$NODE" \
  -H 'accept: application/json' \
  -H "Authorization: Bearer $TOKEN" | jq

echo "Try to edit $NODE"
curl -s -X 'POST' \
  "http://localhost:8000/api/nodes/$TREE/$NODE/$FIELD_TEST" \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $TOKEN" \
  --data-raw '{"values": ["monkey"]}' | jq

echo "Delete $FIELD_TEST"
curl -s -X 'POST' \
  "http://localhost:8000/api/fields/delete?field_set_id=$FIELD_TEST" \
  -H 'accept: application/json' \
  -H "Authorization: Bearer $TOKEN" \
  -d '' | jq

echo "Node values after deleting"
curl -s -X 'GET' \
  "http://localhost:8000/api/nodes/values/$TREE/$NODE" \
  -H 'accept: application/json' \
  -H "Authorization: Bearer $TOKEN" | jq
