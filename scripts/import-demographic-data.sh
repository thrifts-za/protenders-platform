#!/bin/bash
# Load environment variables from .env.local
set -a
source .env.local
set +a

# Run import script
npx tsx scripts/powerbi/import_demographic_data.ts
