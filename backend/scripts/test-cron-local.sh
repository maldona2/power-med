#!/bin/bash

# Test Railway Cron Job Locally
# This script simulates how Railway will run your cron job

echo "🧪 Testing Railway Cron Job Locally"
echo "===================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    echo "   Create .env file with required variables"
    exit 1
fi

# Build the project
echo "📦 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build successful"
echo ""

# Run the cron job
echo "🚀 Running cron job..."
echo "-----------------------------------"
npm run cron

EXIT_CODE=$?

echo "-----------------------------------"
echo ""

# Check exit code
if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ Cron job completed successfully"
    echo ""
    echo "📊 Check the logs above for:"
    echo "   - 'Starting Railway cron job'"
    echo "   - 'sent: X, failed: Y, skipped: Z'"
    echo "   - 'Cron job completed successfully'"
    echo ""
    echo "💾 Verify in database:"
    echo "   SELECT * FROM reminder_deliveries ORDER BY sent_at DESC LIMIT 5;"
else
    echo "❌ Cron job failed with exit code: $EXIT_CODE"
    echo ""
    echo "🔍 Check the logs above for errors"
fi

exit $EXIT_CODE
