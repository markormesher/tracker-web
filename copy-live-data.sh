#! /usr/bin/env bash

ssh deploy@chuck "pg_dump --clean -d tracker > trackerpgdump.sql"
scp deploy@chuck:trackerpgdump.sql .
cat trackerpgdump.sql | psql -d tracker
rm trackerpgdump.sql
ssh deploy@chuck "rm trackerpgdump.sql"
