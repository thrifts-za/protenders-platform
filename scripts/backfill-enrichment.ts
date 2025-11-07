#!/usr/bin/env tsx
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

// Dynamic imports (after dotenv) to ensure DATABASE_URL is loaded before Prisma

function parseArgs() {
  const args = process.argv.slice(2);
  const out: Record<string, string> = {};
  for (const a of args) { const m=a.match(/^--([^=]+)=(.*)$/); if (m) out[m[1]] = m[2]; }
  return out;
}

function toStart(dateStr: string) { return new Date(`${dateStr}T00:00:00Z`); }
function toEnd(dateStr: string) { return new Date(`${dateStr}T23:59:59Z`); }

function deriveTenderNumber(raw: any): string | null {
  const t = raw?.tender;
  if (!t) return null;
  const title = typeof t.title === 'string' ? t.title.trim() : '';
  if (title) {
    let m = title.match(/\b(RFQ|RFP|RFB|RFT|RFI|RFA|RFPQ|RFBQ|EOI)[-_\s:/]*([A-Z0-9/\.-]{3,})/i);
    if (m) return (m[0] || title).replace(/\s+/g, '');
    m = title.match(/([A-Z0-9/\.-]{3,})[-_\s:/]*(RFQ|RFP|RFB|RFT|RFI|RFA|RFPQ|RFBQ|EOI)\b/i);
    if (m) return (m[0] || title).replace(/\s+/g, '');
  }
  if (typeof t.id === 'string' && t.id.trim()) return t.id.trim();
  if (typeof t.id === 'number') return String(t.id);
  return null;
}

async function main() {
  // Prisma is loaded by the backfill helper
  const args = parseArgs();
  const from = args.from || new Date(Date.now() - 7*24*60*60*1000).toISOString().slice(0,10);
  const to = args.to || new Date().toISOString().slice(0,10);
  const limit = Math.max(1, Math.min(2000, parseInt(args.limit || '200', 10)));
  const [{ RATE_LIMIT_DELAY_MS }, { backfillEnrichment }] = await Promise.all([
    import('../src/lib/enrichment/constants'),
    import('../src/lib/enrichment/backfill'),
  ]);
  const delayMs = Math.max(0, parseInt(args.delay || String((RATE_LIMIT_DELAY_MS as any) || 300), 10));

  console.log(`Backfilling enrichment from ${from} to ${to} (limit=${limit}, delay=${delayMs}ms)`);

  const res = await (backfillEnrichment as any)({ from, to, limit, delayMs });
  console.log(`Done. processed=${res.processed} updated=${res.updated} skipped=${res.skipped} failures=${res.failures}`);
}

main().catch((e)=>{ console.error(e); process.exit(1); });
