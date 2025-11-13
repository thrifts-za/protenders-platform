#!/bin/bash
# Load environment variables from .env.local
set -a
source .env.local
set +a

# Run verification script
npx tsx scripts/powerbi/verify_import.ts
