#! /usr/bin/env bash

ssh deploy@chuck "pg_dump -c -d tracker > trackerpgdump.sql"
scp deploy@chuck:trackerpgdump.sql .
cat trackerpgdump.sql | docker exec -i tracker-web-postgres psql -U postgres &>/dev/null
rm trackerpgdump.sql
ssh deploy@chuck "rm trackerpgdump.sql"
