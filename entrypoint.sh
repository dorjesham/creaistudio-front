#!/bin/bash

app_env=${1:-development}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR" || exit 1

# npm CLI shims in .bin must be executable (e.g. after copying from another OS)
ensure_bin_exec() {
    if [ -d "node_modules/.bin" ]; then
        chmod +x node_modules/.bin/* 2>/dev/null || true
    fi
}

if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    ensure_bin_exec
fi

dev_commands() {
    ensure_bin_exec
    echo "Running Vite on 0.0.0.0:3000 (use your SealOS public URL from .env VITE_PUBLIC_APP_URL)..."
    npm run dev
}

prod_commands() {
    ensure_bin_exec
    echo "Building for production..."
    npm run build
    if ! command -v serve &> /dev/null; then
        echo "Installing serve package..."
        npm install -g serve
    fi
    echo "Starting production server (dist/) on 0.0.0.0:3000..."
    npx serve -s dist -l tcp://0.0.0.0:3000
}

if [ "$app_env" = "production" ] || [ "$app_env" = "prod" ]; then
    echo "Production environment detected"
    prod_commands
else
    echo "Development environment detected"
    dev_commands
fi
