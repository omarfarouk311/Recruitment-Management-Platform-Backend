#!/usr/bin/env bash
set -euo pipefail

# 1. Stop and remove Docker Compose services
docker compose down
echo "🛑 Docker Compose services stopped and removed."

# 2. Remove the data directories for instance1 and instance2
for dir in instance1/data instance2/data; do
  if [ -d "./$dir" ]; then
    rm -rf "./$dir"
    echo "✅ Removed directory: ./$dir"
  else
    echo "⚠️ Directory not found, skipping: ./$dir"
  fi
done
