#!/bin/bash
# Load environment variables from .env.local
set -a
source .env.local
set +a

# Push Prisma schema to database (doesn't require migration history)
npx prisma db push
