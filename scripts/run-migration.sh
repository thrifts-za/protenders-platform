#!/bin/bash
# Load environment variables from .env.local
set -a
source .env.local
set +a

# Run Prisma migration
npx prisma migrate dev --name add_demographic_analytics_tables
