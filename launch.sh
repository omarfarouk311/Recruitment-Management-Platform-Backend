#!/usr/bin/env bash
set -euo pipefail

log() {
  local emoji="$1"; shift
  echo -e "${emoji} $*"
}

# 1. Postgres
log "🍀" "Starting Postgres..."
(
  cd "./Postgres" \
    && ./startup.sh \
    && log "✅ Postgres is up."
) || { log "❌ Postgres failed."; exit 1; }

# 2. MinIO
log "🚀" "Starting MinIO..."
(
  cd "./MinIO" \
    && docker compose up -d \
    && log "✅ MinIO is up."
) || { log "❌ MinIO failed."; exit 1; }

# 3. Kafka
log "🚀" "Starting Kafka..."
( 
  cd "./Kafka" \
    && docker compose up -d \
    && log "⏳ Sleeping 120s to let Kafka initialize..."
) || { log "❌ Kafka failed."; exit 1; }
sleep 120
log "✅ Kafka is up."

# 4. Email Server
log "🚀" "Starting Email Server..."
( 
  cd "./Email Server" \
    && docker compose up -d \
    && log "✅ Email Server is up."
) || { log "❌ Email Server failed."; exit 1; }

# 5. Logs Writing Server
log "🚀" "Starting Logs Writing Server..."
( 
  cd "./Logs Writing Server" \
    && docker compose up -d \
    && log "✅ Logs Writing Server is up."
) || { log "❌ Logs Writing Server failed."; exit 1; }

# 6. API Server
log "🚀" "Starting API Servers..."
(
  cd "./Api Server" \
    && docker compose up -d \
    && log "✅ API Servers are up."
) || { log "❌ API Servers failed."; exit 1; }

# 7. Nginx
log "🚀" "Starting Nginx..."
(
  cd "./Nginx" \
    && docker compose up -d \
    && log "✅ Nginx is up."
) || { log "❌ Nginx failed."; exit 1; }

log "🎉" "All services have been started successfully!"

log "🚀" "You can now access the application at http://localhost:8080"
