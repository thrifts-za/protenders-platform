Migrate a specific API route from TenderAPI Express to Next.js API Routes.

Usage: /migrate-api [route-name]
Example: /migrate-api search

Steps:
1. Identify the source route in TenderAPI:
   - Location: /Users/nkosinathindwandwe/DevOps/TenderAPI/apps/api/src/routes/[route-name].ts
2. Read the Express implementation
3. Create Next.js API route:
   - Location: /Users/nkosinathindwandwe/DevOps/protenders-platform/src/app/api/[route-name]/route.ts
4. Convert Express logic to Next.js format:
   - Use NextRequest/NextResponse
   - Use Prisma singleton from @/lib/prisma
   - Add proper error handling
   - Add response caching if appropriate
5. Test the new endpoint
6. Update .claude/migration-status.md marking the route as completed
7. Commit changes

Provide step-by-step guidance for the conversion.
