-- Grant SELECT permission
GRANT SELECT ON ALL TABLES IN SCHEMA public TO select_user;

-- Grant INSERT permission
GRANT INSERT ON ALL TABLES IN SCHEMA public TO insert_user;

-- Grant UPDATE permission
GRANT UPDATE ON ALL TABLES IN SCHEMA public TO update_user;

-- Grant DELETE permission
GRANT DELETE ON ALL TABLES IN SCHEMA public TO delete_user;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO update_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO insert_user;