#!/bin/bash

echo "🎵 Starting MoodPlaylist Server..."
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "server.js" ]; then
    echo "❌ server.js not found. Please run this script from the MoodPlaylist directory."
    exit 1
fi

# Start the server
echo "🚀 Starting server on http://127.0.0.1:3002"
echo "📱 Open your browser and go to: http://127.0.0.1:3002"
echo "🛑 Press Ctrl+C to stop the server"
echo ""

node server.js
