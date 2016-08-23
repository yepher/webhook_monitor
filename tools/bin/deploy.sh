#!/bin/bash

# Do everything relative to the tools/bin directory
cd "$(dirname $0)"

# Copy over new site
scp -r ../../src/* $WEB_HOOK_DEMO



