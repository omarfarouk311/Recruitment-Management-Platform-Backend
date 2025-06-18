#!/usr/bin/env bash
set -euo pipefail

# 1. Start Docker Compose in detached mode
docker compose up -d
echo "🚀 Containers started in detached mode."

# 2. Wait for 120 seconds
echo "⏳ Sleeping 120s to let Postgres initialize..."
sleep 120
echo "✅ Sleep complete."

# 3. Stop all services managed by Docker Compose
docker compose stop
echo "🛑 Containers stopped."

# 4. Execute your replication setup script
if [ -f "./replication_setup.sh" ]; then
  chmod +x ./replication_setup.sh
  echo "🔄 Running replication_setup.sh..."
  ./replication_setup.sh
  echo "✅ replication_setup.sh completed."
else
  echo "⚠️ replication_setup.sh not found!"
fi

# 5. Restart the previously stopped services
docker compose start
echo "🔁 Containers restarted."
