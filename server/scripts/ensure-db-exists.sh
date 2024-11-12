#!/bin/sh

if docker exec coldsire-coldsire_test_db-1 psql -U postgres -w -lqt | cut -d \| -f 1 | grep -qw "$PGDATABASE"; then
  echo "Database $PGDATABASE exists"
else
  docker exec coldsire-coldsire_test_db-1 psql -U postgres -w -c "CREATE DATABASE $PGDATABASE"
  echo "Created database $PGDATABASE"
fi

# Run the CREATE TABLE command within the specified database
docker exec coldsire-coldsire_test_db-1 psql -U postgres -w -d "$PGDATABASE" -c "
CREATE TABLE IF NOT EXISTS domains (
    id SERIAL PRIMARY KEY,
    domain_name VARCHAR(255) NOT NULL UNIQUE,
    spf_status VARCHAR(50),
    dkim_status VARCHAR(50),
    dmarc_status VARCHAR(50),
    last_checked TIMESTAMP DEFAULT NOW()
)"
echo "Created table domains in database $PGDATABASE"
