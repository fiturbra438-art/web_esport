DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'esport_app') THEN
        CREATE ROLE esport_app NOLOGIN;
    END IF;
END
$$;