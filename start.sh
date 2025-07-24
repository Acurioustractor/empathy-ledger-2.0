#!/bin/bash
# Empathy Ledger Startup Script

echo "🚀 Starting Empathy Ledger..."

# Source environment
if [ -f .env.development ]; then
    export $(grep -v '^#' .env.development | xargs)
    echo "✅ Environment loaded from .env.development"
else
    echo "❌ Environment file not found"
    exit 1
fi

# Run health check with environment
echo "Running health check..."
node monitoring/health-check.js

if [ $? -eq 0 ]; then
    echo "✅ Health check passed. Starting application..."
    npm run dev
else
    echo "❌ Health check failed. Please check configuration."
    exit 1
fi