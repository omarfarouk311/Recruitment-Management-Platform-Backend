#!/usr/bin/env bash
set -euo pipefail

log() {
  local emoji="$1"; shift
  echo -e "${emoji} $*"
}

# 1. Postgres
log "🍀" "Starting Postgres containers..."
(
  cd "./Postgres" \
    && docker compose start \
    && log "✅ Postgres containers started."
) || { log "❌ Failed to start Postgres"; exit 1; }

# 2. MinIO
log "🚀" "Starting MinIO containers..."
(
  cd "./MinIO" \
    && docker compose start \
    && log "✅ MinIO containers started."
) || { log "❌ Failed to start MinIO"; exit 1; }

# 3. Kafka
log "🚀" "Starting Kafka containers..."
(
  cd "./Kafka" \
    && docker compose start \
    && log "⏳ Sleeping 90s for Kafka to initialize..."
) || { log "❌ Failed to start Kafka"; exit 1; }
sleep 90
log "✅ Kafka should be ready."

# 4. Email Server
log "📧" "Starting Email Server containers (detached)..."
(
  cd "./Email Server" \
    && docker compose start \
    && log "✅ Email Server started."
) || { log "❌ Failed to start Email Server"; exit 1; }

# 5. Logs Writing Server
log "📝" "Starting Logs Writing Server containers (detached)..."
(
  cd "./Logs Writing Server" \
    && docker compose start \
    && log "✅ Logs Writing Server started."
) || { log "❌ Failed to start Logs Writing Server"; exit 1; }

# 6. API Server
log "🔌" "Starting API Server containers (detached)..."
(
  cd "./Api Server" \
    && docker compose start \
    && log "✅ API Server started."
) || { log "❌ Failed to start API Server"; exit 1; }

# 7. Nginx
log "🌐" "Starting Nginx containers (detached)..."
(
  cd "./Nginx" \
    && docker compose start \
    && log "✅ Nginx started."
) || { log "❌ Failed to start Nginx"; exit 1; }

log "🎉" "All services have been started successfully!"

log "🚀" "You can now access the application at http://localhost:8080"
