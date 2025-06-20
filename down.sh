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
) || log "❌ Failed to tear down MinIO"

# 4. Email Server
log "📧" "Removing Email Server..."
(
  cd "./Email Server" \
    && docker compose down -v \
    && log "✅ Email Server containers & volumes removed."
) || log "❌ Failed to tear down Email Server"

# 5. Logs Writing Server
log "📝" "Removing Logs Writing Server..."
(
  cd "./Logs Writing Server" \
    && docker compose down -v \
    && log "✅ Logs Writing Server containers & volumes removed."
) || log "❌ Failed to tear down Logs Writing Server"

# 6. API Server
log "🔌" "Removing API Server..."
(
  cd "./Api Server" \
    && docker compose down -v \
    && log "✅ API Server containers & volumes removed."
) || log "❌ Failed to tear down API Server"

# 7. Nginx
log "🌐" "Removing Nginx..."
(
  cd "./Nginx" \
    && docker compose down -v \
    && log "✅ Nginx containers & volumes removed."
) || log "❌ Failed to tear down Nginx"

log "🎉" "All services have been fully removed with their volumes!"
