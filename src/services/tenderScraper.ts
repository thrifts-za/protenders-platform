import cheerio from "cheerio";

export interface BriefingSession {
  hasBriefing: boolean;
  isCompulsory: boolean;
  date?: string;
  time?: string;
  venue?: string;
  meetingLink?: string;
}

export interface TenderEnrichment {
  contactPerson?: string;
  contactEmail?: string;
  contactTelephone?: string;
  contactFax?: string;
  province?: string;
  deliveryAddress?: string;
  specialConditions?: string;
  briefingSession?: BriefingSession;
}

// Simple rate limiter: 1 request every 2 seconds
let lastRequestAt = 0;
async function rateLimit() {
  const now = Date.now();
  const elapsed = now - lastRequestAt;
  const minInterval = 2000;
  if (elapsed < minInterval) {
    await new Promise((r) => setTimeout(r, minInterval - elapsed));
  }
  lastRequestAt = Date.now();
}

function textOrUndefined(value?: string | null): string | undefined {
  const v = value?.trim();
  return v ? v : undefined;
}

async function fetchWithRetry(url: string, attempts = 3): Promise<Response> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      await rateLimit();
      const res = await fetch(url, { method: "GET", headers: { "User-Agent": "ProTendersBot/1.0 (+https://protenders.co.za)" }, cache: "no-store" });
      if (res.ok) return res;
      lastErr = new Error(`HTTP ${res.status}`);
    } catch (e) {
      lastErr = e;
    }
    const delay = 500 * Math.pow(2, i);
    await new Promise((r) => setTimeout(r, delay));
  }
  throw lastErr instanceof Error ? lastErr : new Error("Failed to fetch after retries");
}

export async function scrapeTenderDetails(tenderId: string): Promise<TenderEnrichment | null> {
  const url = `https://www.etenders.gov.za/Tenders/Details/${encodeURIComponent(tenderId)}`;

  try {
    const res = await fetchWithRetry(url, 3);
    const html = await res.text();
    const $ = cheerio.load(html);

    const getField = (label: string): string | undefined => {
      const cell = $("td").filter((_, el) => $(el).text().trim().toLowerCase().startsWith(label.toLowerCase()));
      if (cell.length) {
        const valueCell = cell.next();
        if (valueCell && valueCell.length) return textOrUndefined(valueCell.text());
      }
      const dt = $("dt").filter((_, el) => $(el).text().trim().toLowerCase().includes(label.toLowerCase()));
      if (dt.length) {
        const dd = dt.next("dd").first();
        if (dd && dd.length) return textOrUndefined(dd.text());
      }
      return undefined;
    };

    const enrichment: TenderEnrichment = {};

    enrichment.contactPerson = getField("Contact Person") || getField("Enquiries Contact Person");
    enrichment.contactEmail = getField("Email") || getField("E-mail");
    enrichment.contactTelephone = getField("Telephone") || getField("Tel");
    enrichment.contactFax = getField("Fax") || getField("FAX");

    enrichment.deliveryAddress = getField("Place where goods") || getField("Place where services") || getField("Delivery Address");
    enrichment.province = getField("Province");

    enrichment.specialConditions = getField("Special Conditions") || getField("Special condition");

    const briefingYesNo = getField("Is there a briefing session?");
    const compulsoryYesNo = getField("Is it compulsory?");
    const briefingDateTime = getField("Briefing Date and Time") || getField("Briefing Date") || getField("Briefing Time");
    const briefingVenue = getField("Briefing Venue");

    const hasBriefing = (briefingYesNo || "").toLowerCase().includes("yes");
    const isCompulsory = (compulsoryYesNo || "").toLowerCase().includes("yes");

    if (hasBriefing || briefingVenue || briefingDateTime) {
      const bs: BriefingSession = {
        hasBriefing,
        isCompulsory,
        venue: textOrUndefined(briefingVenue),
      };
      if (briefingDateTime) {
        const parts = briefingDateTime.split(/\s+-\s+/);
        if (parts.length === 2) {
          bs.date = textOrUndefined(parts[0]);
          bs.time = textOrUndefined(parts[1]);
        } else {
          bs.date = textOrUndefined(briefingDateTime);
        }
      }
      enrichment.briefingSession = bs;
    }

    const hasAny = Object.values(enrichment).some((v) => {
      if (v == null) return false;
      if (typeof v === "object") return Object.values(v).some((x) => x);
      return Boolean(v);
    });

    return hasAny ? enrichment : null;
  } catch {
    return null;
  }
}


