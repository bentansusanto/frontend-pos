#!/bin/bash

# Start PM2 script for traveler-site deployment
# This script ensures PM2 starts correctly with ecosystem.config.js

echo "🚀 Starting POS App with PM2..."

# Stop any existing PM2 processes
pm2 delete pos-app 2>/dev/null || true

# Wait a moment
sleep 2

# Start with ecosystem config
pm2 start ecosystem.config.js --env production

# Save PM2 process list
pm2 save

# Show status
pm2 list

echo "✅ POS App started successfully!"
