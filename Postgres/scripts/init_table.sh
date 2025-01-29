set -e
psql -v ON_ERROR_STOP=1 --username postgres --dbname app -f /scripts/table_creation.sql 