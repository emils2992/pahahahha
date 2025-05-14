#!/bin/bash

# Kill any existing Node.js processes
pkill node || true

# Wait a moment for ports to be released
sleep 2

# Run the CommonJS version
node server/index.cjs