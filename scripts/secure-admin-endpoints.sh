#!/bin/bash

# Script to add authentication to all admin API endpoints
# This adds requireAdmin() checks to all /api/admin routes

echo "🔒 Securing Admin API Endpoints..."

# Array of admin endpoint files to secure (excluding already secured ones)
files=(
  "src/app/api/admin/tenders/[ocid]/route.ts"
  "src/app/api/admin/users/route.ts"
  "src/app/api/admin/users/[id]/route.ts"
  "src/app/api/admin/alerts/logs/route.ts"
  "src/app/api/admin/alerts/run/route.ts"
  "src/app/api/admin/analytics/errors/route.ts"
  "src/app/api/admin/analytics/searches/route.ts"
  "src/app/api/admin/audit/route.ts"
  "src/app/api/admin/buyers/route.ts"
  "src/app/api/admin/documents/recent/route.ts"
  "src/app/api/admin/enrichment/cancel/route.ts"
  "src/app/api/admin/enrichment/progress/route.ts"
  "src/app/api/admin/feedback/route.ts"
  "src/app/api/admin/feedback/[id]/route.ts"
  "src/app/api/admin/jobs/[id]/cancel/route.ts"
  "src/app/api/admin/jobs/aggregates/route.ts"
  "src/app/api/admin/jobs/delta-sync/route.ts"
  "src/app/api/admin/jobs/docs/route.ts"
  "src/app/api/admin/jobs/download/route.ts"
  "src/app/api/admin/jobs/enrich-backfill/cleanup/route.ts"
  "src/app/api/admin/jobs/enrich-backfill/route.ts"
  "src/app/api/admin/jobs/enrich-today/route.ts"
  "src/app/api/admin/jobs/enrichment/cancel/route.ts"
  "src/app/api/admin/jobs/features/route.ts"
  "src/app/api/admin/jobs/import/route.ts"
  "src/app/api/admin/jobs/reindex/route.ts"
  "src/app/api/admin/jobs/sync-now/route.ts"
  "src/app/api/admin/jobs/sync-today/route.ts"
  "src/app/api/admin/mail/logs/route.ts"
  "src/app/api/admin/mail/template/route.ts"
  "src/app/api/admin/mail/test/route.ts"
  "src/app/api/admin/sync/state/route.ts"
)

secured=0
skipped=0
errors=0

for file in "${files[@]}"; do
  if [ ! -f "$file" ]; then
    echo "⚠️  File not found: $file"
    ((errors++))
    continue
  fi

  # Check if already secured
  if grep -q "requireAdmin" "$file"; then
    echo "✓ Already secured: $file"
    ((skipped++))
    continue
  fi

  echo "🔧 Securing: $file"

  # Add import if not present
  if ! grep -q "import.*requireAdmin" "$file"; then
    # Find the import section and add requireAdmin import
    sed -i '' "/^import.*from '@\/lib\/prisma';$/a\\
import { requireAdmin } from '@/lib/auth-middleware';
" "$file"
  fi

  # Add auth check to each exported async function
  # This handles GET, POST, PUT, PATCH, DELETE
  sed -i '' '/^export async function \(GET\|POST\|PUT\|PATCH\|DELETE\)/a\
  // Require admin authentication\
  try {\
    await requireAdmin();\
  } catch (error) {\
    return NextResponse.json(\
      { error: '\''Unauthorized - Admin access required'\'' },\
      { status: 401 }\
    );\
  }\

' "$file"

  ((secured++))
done

echo ""
echo "✅ Security Update Complete!"
echo "   Secured: $secured files"
echo "   Skipped: $skipped files (already secured)"
echo "   Errors: $errors files"
echo ""
echo "ℹ️  Next steps:"
echo "   1. Review the changes with: git diff"
echo "   2. Test the secured endpoints"
echo "   3. Commit the security fixes"
