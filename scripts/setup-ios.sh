#!/bin/bash

# Setup script for iOS development build

set -e

echo "🚀 Setting up iOS development environment..."

# Check if ios directory exists
if [ -d "ios" ]; then
    echo "⚠️  iOS directory already exists. Cleaning..."
    rm -rf ios
fi

# Generate native iOS project
echo "📱 Generating native iOS project..."
npx expo prebuild --platform ios --clean

echo "✅ iOS project setup complete!"
echo ""
echo "To build and run:"
echo "  Option 1 (CLI): npx expo run:ios"
echo "  Option 2 (Xcode): open ios/exposupabasestarter.xcworkspace"
echo ""
