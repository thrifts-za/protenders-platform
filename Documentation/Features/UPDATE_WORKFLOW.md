# Update GitHub Actions Workflow

The workflow file needs to be updated to send Inngest events instead of calling the API directly. Due to GitHub security restrictions, this must be done via the web interface.

## Quick Update Instructions

### Option 1: Via GitHub Web Interface (Recommended - 2 minutes)

1. **Go to the workflow file:**
   - Visit: https://github.com/thrifts-za/protenders-platform/edit/main/.github/workflows/scheduled-jobs.yml

2. **Replace the `sync` job** (lines 12-24) with:
   ```yaml
   sync:
     if: github.event.schedule == '*/30 * * * *' || github.event_name == 'workflow_dispatch'
     runs-on: ubuntu-latest
     steps:
       - name: Send Inngest tender sync event
         env:
           INNGEST_EVENT_KEY: ${{ secrets.INNGEST_EVENT_KEY }}
         run: |
           set -euo pipefail
           curl -sS -X POST "https://inn.gs/e/$INNGEST_EVENT_KEY" \
             -H "Content-Type: application/json" \
             -d '{
               "name": "tender/sync.requested",
               "data": {
                 "maxEnrichment": 300,
                 "requireEnrichment": true,
                 "triggeredBy": "github-actions"
               }
             }'
   ```

3. **Commit the change:**
   - Commit message: `feat: Update workflow to send Inngest events`
   - Commit directly to the `main` branch

### Option 2: Pull the Local Changes (Alternative)

If you have local changes already staged:

```bash
# Stage the workflow file
git add .github/workflows/scheduled-jobs.yml

# Commit
git commit -m "feat: Update workflow to send Inngest events"

# You'll need to authenticate with workflow scope
# Follow the prompts to grant the workflow scope to your GitHub token
git push origin main
```

## What This Does

**Before:** GitHub Actions calls `/api/cron/sync` directly
- Subject to 5-minute Vercel timeout
- Holds database connections during enrichment
- No step-based execution or retries

**After:** GitHub Actions sends event to Inngest
- Event: `tender/sync.requested`
- Inngest executes function with no timeout
- Step-based execution with automatic retries
- Proper connection pool management

## Verification

After updating, the workflow will:

1. **Next Cron Run** (every 30 minutes)
   - Send event to Inngest: `https://inn.gs/e/[YOUR_KEY]`
   - Inngest triggers your function
   - Monitor at: https://app.inngest.com

2. **Manual Trigger** (for testing)
   ```bash
   gh workflow run scheduled-jobs.yml
   ```

3. **Check Execution**
   - Inngest dashboard: https://app.inngest.com
   - Job logs in admin dashboard
   - GitHub Actions logs

## Current Status

- ✅ Inngest infrastructure deployed
- ✅ Functions registered at `/api/inngest`
- ✅ Environment variables configured
- ⏳ **Workflow update pending** (this step)
- ⏳ Register with Inngest platform (next step)

## Next Step After Update

Once the workflow is updated, register your app with Inngest:

1. **Create Vercel Deployment Protection Bypass Secret:**
   - Go to Vercel project settings: https://vercel.com/nkosis-projects-0cee20c5/protenders-platform/settings/deployment-protection
   - Click "Add a new secret to bypass Deployment Protection"
   - Generate a secret (use a password manager or run: `openssl rand -hex 32`)
   - Name it: `inngest` (or any name you prefer)
   - Save the secret value - you'll need it in the next step

2. **Register with Inngest:**
   - Go to https://app.inngest.com
   - Navigate to your production environment
   - Add your app URL with the bypass secret:
     ```
     https://www.protenders.co.za/api/inngest?x-vercel-protection-bypass=YOUR_SECRET_VALUE
     ```
   - Replace `YOUR_SECRET_VALUE` with the secret you created in step 1
   - Inngest will sync your functions automatically

3. **Test the Integration:**
   - Trigger the workflow manually: `gh workflow run scheduled-jobs.yml`
   - Or wait for next cron run (every 30 minutes)
   - Monitor at https://app.inngest.com

## Vercel Deployment Protection

If Inngest can't access your endpoint (403/401 errors), it's likely due to Vercel Deployment Protection. You have two options:

### Option 1: Use Bypass Token (Recommended)
Add the bypass token as a query parameter to your Inngest app URL:
```
https://your-domain.com/api/inngest?x-vercel-protection-bypass=YOUR_TOKEN
```

### Option 2: Disable Protection for API Routes
In `vercel.json`, exclude the Inngest endpoint:
```json
{
  "protectionBypass": {
    "routes": ["/api/inngest"]
  }
}
```

**Recommendation:** Use Option 1 (bypass token) as it's more secure and doesn't require code changes.
