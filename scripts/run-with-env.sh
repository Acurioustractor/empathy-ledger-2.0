#!/bin/bash

# Load environment variables and run command
if [ -f .env.development ]; then
    export $(grep -v '^#' .env.development | xargs)
    echo "✅ Environment loaded from .env.development"
else
    echo "❌ .env.development not found"
    exit 1
fi

# Run the command passed as arguments
exec "$@"