#!/bin/bash

# FAIL FRENZY - Quick Start Script (Linux/Mac)
# Usage: ./quick-start.sh

set -e

echo "🚀 FAIL FRENZY - Quick Start Script"
echo "===================================="
echo ""

# Check Node.js
echo "📦 Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version must be 18 or higher (current: $(node -v))"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo ""

# Check npm
echo "📦 Checking npm..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed!"
    exit 1
fi
echo "✅ npm $(npm -v) detected"
echo ""

# Install dependencies
echo "📥 Installing dependencies..."
echo "This may take 2-3 minutes..."
npm install

echo ""
echo "✅ Dependencies installed!"
echo ""

# Build project
echo "🔨 Building project..."
npm run build

echo ""
echo "✅ Build complete!"
echo ""

# Start dev server
echo "🚀 Starting development server..."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ FAIL FRENZY is ready!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Local:   http://localhost:5173"
echo "🎮 Game:    http://localhost:5173/game"
echo ""
echo "Press Ctrl+C to stop the server"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Open browser (optional)
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:5173 &> /dev/null &
elif command -v open &> /dev/null; then
    open http://localhost:5173 &> /dev/null &
fi

# Start dev server
npm run dev
