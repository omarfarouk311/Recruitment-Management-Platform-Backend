#!/usr/bin/env bash
set -euo pipefail

log() {
  local emoji="$1"; shift
  echo -e "${emoji} $*"
}

# 1. Postgres
log "🍀" "Removing & cleaning Postgres..."
(
  cd "./Postgres" \
    && ./delete_data.sh \
    && log "✅ Postgres data deleted and containers removed."
) || log "❌ Failed to clean Postgres"

# 2. Kafka
log "🚀" "Removing & cleaning Kafka..."
(
  cd "./Kafka" \
    && ./delete_data.sh \
    && log "✅ Kafka data deleted and containers removed."
) || log "❌ Failed to clean Kafka"

# 3. MinIO
log "💾" "Removing MinIO..."
(
  cd "./MinIO" \
    && docker compose down -v \
    && log "✅ MinIO containers & volumes removed."
) || log "❌ Failed to remove MinIO"

# 4. Email Server
log "📧" "Removing Email Server..."
(
  cd "./Email Server" \
    && docker compose down \
    && log "✅ Email Server containers removed."
) || log "❌ Failed to remove Email Server"

# 5. Logs Writing Server
log "📝" "Removing Logs Writing Server..."
(
  cd "./Logs Writing Server" \
    && docker compose down \
    && log "✅ Logs Writing Server containers removed."
) || log "❌ Failed to remove Logs Writing Server"

# 6. API Server
log "🔌" "Removing API Server..."
(
  cd "./Api Server" \
    && docker compose down \
    && log "✅ API Server containers removed."
) || log "❌ Failed to remove API Server"

# 7. Nginx
log "🌐" "Removing Nginx..."
(
  cd "./Nginx" \
    && docker compose down \
    && log "✅ Nginx containers removed."
) || log "❌ Failed to remove Nginx"

# 8. Remove internal Docker network if it exists
NETWORK="internal-net"
log "🌐" "Checking for Docker network '$NETWORK'..."
if docker network inspect "$NETWORK" >/dev/null 2>&1; then
  docker network rm "$NETWORK" \
    && log "✅ Network '$NETWORK' removed."
else
  log "ℹ️" "Network '$NETWORK' does not exist; skipping removal."
fi

log "🎉" "All networks and services have been fully removed with their volumes!"
