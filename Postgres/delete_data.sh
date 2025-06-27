#!/usr/bin/env bash
set -euo pipefail

# 1. Stop and remove Docker Compose services
docker compose down
echo "🛑 Docker Compose services have been stopped and removed."

# 2. Remove local directories
for dir in master standby1 standby2; do
  if [ -d "./$dir" ]; then
    rm -rf "./$dir"
    echo "✅ Removed directory: ./$dir"
  else
    echo "⚠️ Directory not found, skipping: ./$dir"
  fi
done
