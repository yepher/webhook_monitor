#!/bin/bash

# Do everything relative to the tools/bin directory
cd "$(dirname $0)"

echo "Make sure browser is open to http://localhost:3000/?hookId=12345"

curl -X POST -d @test.json http://localhost:8080/12345

echo ""
echo "done"
