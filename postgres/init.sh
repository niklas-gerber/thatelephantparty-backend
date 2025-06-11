#!/bin/bash
set -e

# Wait for PostgreSQL to be ready
until pg_isready -U $POSTGRES_USER; do sleep 1; done

# Create user if not exists
psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" <<-EOSQL
    DO \$$
    BEGIN
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = '$DB_USER') THEN
            EXECUTE format('CREATE USER %I WITH PASSWORD %L', '$DB_USER', '$DB_PASSWORD');
        END IF;
    END
    \$$;
    
    SELECT 'CREATE DATABASE $DB_NAME WITH OWNER $DB_USER'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME')\gexec
    
    \c $DB_NAME
    CREATE SCHEMA IF NOT EXISTS app;
    GRANT ALL PRIVILEGES ON SCHEMA app TO $DB_USER;
    ALTER USER $DB_USER SET search_path = 'app, public';
EOSQL