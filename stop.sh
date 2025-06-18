#!/usr/bin/env bash
set -euo pipefail

log() {
  local emoji="$1"; shift
  echo -e "${emoji} $*"
}

# 1. Postgres
log "🍀" "Stopping Postgres containers..."
(
  cd "./Postgres" \
    && docker compose stop \
    && log "✅ Postgres stopped."
) || log "❌ Failed to stop Postgres"

# 2. MinIO
log "🚀" "Stopping MinIO containers..."
(
  cd "./MinIO" \
    && docker compose stop \
    && log "✅ MinIO stopped."
) || log "❌ Failed to stop MinIO"

# 3. Kafka
log "🚀" "Stopping Kafka containers..."
(
  cd "./Kafka" \
    && docker compose stop \
    && log "✅ Kafka stopped."
) || log "❌ Failed to stop Kafka"

# 4. Email Server
log "📧" "Stopping Email Server containers..."
(
  cd "./Email Server" \
    && docker compose stop \
    && log "✅ Email Server stopped."
) || log "❌ Failed to stop Email Server"

# 5. Logs Writing Server
log "📝" "Stopping Logs Writing Server containers..."
(
  cd "./Logs Writing Server" \
    && docker compose stop \
    && log "✅ Logs Writing Server stopped."
) || log "❌ Failed to stop Logs Writing Server"

# 6. API Server
log "🔌" "Stopping API Server containers..."
(
  cd "./Api Server" \
    && docker compose stop \
    && log "✅ API Server stopped."
) || log "❌ Failed to stop API Server"

# 7. Nginx
log "🌐" "Stopping Nginx containers..."
(
  cd "./Nginx" \
    && docker compose stop \
    && log "✅ Nginx stopped."
) || log "❌ Failed to stop Nginx"

log "🎉" "All services have been stopped successfully!"
