-- Trigger for automating partition creation

CREATE OR REPLACE FUNCTION create_partition()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    partition_start INTEGER;
    partition_end INTEGER;
    partition_name TEXT;
    partition_exists BOOLEAN;
BEGIN
    -- Calculate the partition range based on the user_id
    partition_start := (NEW.id / 15000 + 1) * 15000 + 1;
    partition_end := partition_start + 14999;
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
            Execute format(
                'ALTER TABLE %I ADD FOREIGN KEY (job_id) REFERENCES Job (id) ON DELETE CASCADE;',
                partition_name
            );
            Execute format(
                'ALTER TABLE %I ADD FOREIGN KEY (seeker_id) REFERENCES Job_Seeker (id) ON DELETE CASCADE;',
                partition_name
            );

        END IF;
    END IF;

    RETURN NEW;
END;
$$ ;

CREATE TRIGGER create_partition_trigger
AFTER INSERT ON Job_Seeker
FOR EACH ROW WHEN (NEW.id % 15000 > 14500)
EXECUTE FUNCTION create_partition();