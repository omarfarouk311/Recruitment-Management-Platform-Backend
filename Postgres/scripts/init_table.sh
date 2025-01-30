set -e
psql -v ON_ERROR_STOP=1 --username postgres --dbname app -f /scripts/init_app_db.sql 
psql -v ON_ERROR_STOP=1 --username postgres --dbname keycloak -f /scripts/keycloak_db_permissions.sql 