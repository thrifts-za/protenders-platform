# Inngest Event Key Setup

## Issue
The GitHub Actions workflow is failing with: `{"data":null,"error":"Event key not found","error_code":"event_key_not_found"}`

This means the `INNGEST_EVENT_KEY` in GitHub Secrets is incorrect or not found by Inngest.

## Solution

### Step 1: Get the Correct Event Key from Inngest

1. **Go to Inngest Dashboard:**
   - Visit: https://app.inngest.com
   - Navigate to your project/workspace

2. **Find the Event Key:**
   - Go to **Settings** → **Event Keys** (or **Keys** section)
   - Look for your production environment event key
   - It should look like: `Nf2IgcgqZm12QwV6TMKv_9lnZSBAv6iVB8Oq4wvH7QuECMmD2Mdpp_CwvMdHZhdayh_qkUfXZeKyGjy1VvQkQ` (example)
   - **Copy the entire key** (without any leading/trailing spaces or characters)

### Step 2: Update GitHub Secret

Run this command with the EXACT key from Inngest (replace `YOUR_EVENT_KEY_HERE` with the actual key):

```bash
gh secret set INNGEST_EVENT_KEY --body "YOUR_EVENT_KEY_HERE"
```

**Important:**
- Do NOT include quotes in the key itself
- Do NOT include any dashes or spaces before/after the key
- Copy-paste directly from Inngest dashboard

### Step 3: Test the Integration

After updating the secret, trigger the workflow:

```bash
gh workflow run scheduled-jobs.yml
```

Then check the logs:

```bash
# Wait a few seconds, then check status
gh run list --workflow=scheduled-jobs.yml --limit 1

# Get the run ID and view logs
gh run view [RUN_ID] --log | grep -A 5 "Send Inngest"
```

### Step 4: Verify in Inngest Dashboard

1. Go to https://app.inngest.com
2. Navigate to **Functions** → **tender-sync**
3. Check **Recent Runs** to see if the event triggered the function
4. Look for event name: `tender/sync.requested`

## Expected Success Output

When successful, the workflow logs should show:

```
Send Inngest tender sync event
{"ids":["01JC..."],"status":"ok"}
```

And in Inngest dashboard, you should see:
- New function run with status: Running or Completed
- Event payload with `triggeredBy: "github-actions"`

## Troubleshooting

### Still getting "Event key not found"
- Double-check you copied the Event Key (not Signing Key)
- Verify no extra characters in the GitHub Secret
- Try regenerating the Event Key in Inngest dashboard

### Events sent but function not triggered
- Check that your app is registered with Inngest at: `https://www.protenders.co.za/api/inngest`
- Verify the function is visible in Inngest dashboard
- Check event name matches exactly: `tender/sync.requested`

### Function triggered but failing
- Check function logs in Inngest dashboard
- Verify `INNGEST_SIGNING_KEY` is set in Vercel environment variables
- Check database connection and other environment variables

## Current Status

- ✅ Inngest infrastructure deployed
- ✅ Functions registered at `/api/inngest`
- ✅ Workflow updated to send Inngest events
- ⏳ **Event Key needs verification** (this step)

## Next Steps

Once the Event Key is verified and working:

1. Monitor the first successful run in Inngest dashboard
2. Check job logs in admin dashboard
3. Verify tenders are being enriched correctly
4. Consider deprecating the old `/api/cron/sync` route

## Support

- **Inngest Documentation:** https://www.inngest.com/docs/events
- **Event Keys Guide:** https://www.inngest.com/docs/events/send-events
- **Dashboard:** https://app.inngest.com
