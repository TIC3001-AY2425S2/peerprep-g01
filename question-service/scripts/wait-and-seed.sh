#!/bin/sh

# Run the seed script
echo "Seeding database..."
node scripts/seed.js

# Start the application
echo "Starting application..."
npm start 