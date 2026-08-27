#!/bin/bash

BASE_URL="http://localhost:3000/api"
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImI2YTU3YmU0LTg4ZDUtNGYwMC04MGNmLTA4ODYzZGRjYTA0YyIsInJvbGUiOiJjbGllbnQiLCJpYXQiOjE3ODY0NTc2NzUsImV4cCI6MTc4NzA2MjQ3NX0.pZjieTPEA_mXI78gXWDL9srrmsxtNz8zCJgdE7-x6tU"
USER_ID="b6a57be4-88d5-4f00-80cf-08863ddca04c"

echo "=== 1. GET /users/me (profil, devrait réussir) ==="
curl -s -X GET "$BASE_URL/users/me" \
  -H "Authorization: Bearer $TOKEN" | head -c 500
echo -e "\n"

echo "=== 2. PUT /users/me (modifier son profil, devrait réussir) ==="
curl -s -X PUT "$BASE_URL/users/me" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"nom":"Rakoto","prenom":"JeanModifie","telephone":"0349999999"}' | head -c 500
echo -e "\n"

echo "=== 3. GET /users (liste admin, devrait échouer 403 car role=client) ==="
curl -s -X GET "$BASE_URL/users" \
  -H "Authorization: Bearer $TOKEN" | head -c 500
echo -e "\n"

echo "=== 4. PUT /users/:id/role (changer un rôle, devrait échouer 403) ==="
curl -s -X PUT "$BASE_URL/users/$USER_ID/role" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"role":"admin"}' | head -c 500
echo -e "\n"

echo "=== FIN DES TESTS ==="
