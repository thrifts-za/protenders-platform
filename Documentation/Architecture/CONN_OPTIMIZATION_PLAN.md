# Connection Pool Optimization Plan

## Current Status
- ✅ **Immediate fix applied:** Increased connection pool from 10 to 25
- ⏳ **In progress:** Code optimization for connection management

## Problem
The cron sync route holds database connections during 30+ second external API calls to eTenders, causing connection pool exhaustion.

## Simplified Optimization Approach

Instead of a complete rewrite, apply targeted fixes:

### 1. Batch Processing with Connection Release (Lower Risk)
Add explicit connection management after batches:

```typescript
// Process in smaller batches
const MICRO_BATCH_SIZE = 5;

for (let i = 0; i < releases.length; i += MICRO_BATCH_SIZE) {
  const batch = releases.slice(i, i + MICRO_BATCH_SIZE);

  // Process batch...

  // Force connection release after each micro-batch
  await prisma.$disconnect();
  await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
}
```

### 2. Separate Enrichment from DB Operations
- Collect all data first (quick DB queries)
- Do ALL enrichment calls (no DB connection)
- Write results in batches (quick DB operations)

## Benefits of Simplified Approach
- ✅ Lower risk of bugs
- ✅ Easier to test
- ✅ Can be applied incrementally
- ✅ Maintains current logic flow
- ✅ Still achieves main goal: connections not held during enrichment

## Implementation Priority
1. Add explicit `$disconnect()` after each batch (5 tenders)
2. Add small delays between batches (let other requests through)
3. Monitor connection usage in production
4. If needed, full refactor with batch processor (already created)

## Monitoring
After deployment, monitor:
- Connection pool metrics
- P1017 error frequency
- API endpoint response times
- Enrichment job duration
