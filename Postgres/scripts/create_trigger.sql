-- Trigger for automating partition creation

CREATE OR REPLACE FUNCTION create_partition()
RETURNS TRIGGER AS $$
DECLARE
    partition_start INTEGER;
    partition_end INTEGER;
    partition_name TEXT;
    partition_exists BOOLEAN;
BEGIN
    -- Calculate the partition range based on the user_id
    partition_start := (NEW.id / 10000 + 1) * 10000 + 1;
    partition_end := partition_start + 9999;
    partition_name := 'recommendations_' || partition_start || '_' || partition_end;

    -- Acquire a transaction-level advisory lock to prevent race conditions
    IF pg_try_advisory_xact_lock(partition_start) THEN
        -- Check if the partition exists and create it if not
        SELECT EXISTS (
            SELECT 1
            FROM information_schema.tables
            WHERE table_name = partition_name
        ) INTO partition_exists;

        IF NOT partition_exists THEN
            EXECUTE format(
                'CREATE TABLE %I PARTITION OF recommendations FOR VALUES FROM (%s) TO (%s);',
                partition_name,
                partition_start,
                partition_end + 1
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_partition_trigger
AFTER INSERT ON Job_Seeker
FOR EACH ROW WHEN (NEW.id % 10000 > 9500)
EXECUTE FUNCTION create_partition();