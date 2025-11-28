#!/usr/bin/env bash
# Build script for Render deployment

echo "Installing dependencies from backend/requirements.txt..."
pip install -r backend/requirements.txt

echo "Build completed successfully!"
