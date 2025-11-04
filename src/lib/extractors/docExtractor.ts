export type ExtractedField<T = any> = { value: T | null; source: string; confidence: number };

export type DocExtraction = {
  meta: {
    tenderNumber: ExtractedField<string>;
    title: ExtractedField<string>;
    buyer: ExtractedField<string>;
    publishedDate: ExtractedField<string>;
  };
  dates: {
    briefing: ExtractedField<string>;
    enquiriesClose: ExtractedField<string>;
    submissionClose: ExtractedField<string>;
    validityPeriod: ExtractedField<string>;
    implementationPeriod: ExtractedField<string>;
  };
  submission: {
    method: ExtractedField<string>;
    address: ExtractedField<string>;
    email: ExtractedField<string>;
    url: ExtractedField<string>;
    envelopeSystem: ExtractedField<string>;
    instructions: ExtractedField<string>;
    lateBidPolicy: ExtractedField<string>;
  };
  eligibility: {
    csd: ExtractedField<boolean>;
    taxCompliance: ExtractedField<boolean>;
    cidb: ExtractedField<string>;
    bbbee: ExtractedField<string>;
    oem: ExtractedField<string>;
    localContent: ExtractedField<string>;
    mandatoryBriefing: ExtractedField<boolean>;
    other: ExtractedField<string>;
  };
  evaluation: {
    method: ExtractedField<string>; // 80/20 or 90/10
    functionalityThreshold: ExtractedField<string>;
    scoringRubric: ExtractedField<string>;
  };
  scope: {
    description: ExtractedField<string>;
    lots: ExtractedField<string>;
    delivery: ExtractedField<string>;
  };
  commercial: {
    pricing: ExtractedField<string>;
    currencyVat: ExtractedField<string>;
    bidBond: ExtractedField<string>;
    performanceSecurity: ExtractedField<string>;
    penalties: ExtractedField<string>;
    warranty: ExtractedField<string>;
    sla: ExtractedField<string>;
  };
  contacts: {
    enquiries: ExtractedField<string>;
    submission: ExtractedField<string>;
  };
  raw: string; // full text for traceability
};

function ef<T = any>(value: T | null, source = 'doc.text', confidence = 0.6): ExtractedField<T> {
  return { value, source, confidence };
}

function clean(s: string): string { return s.replace(/\s+/g, ' ').trim(); }

function pickAfter(lines: string[], label: RegExp): string | null {
  const i = lines.findIndex((l) => label.test(l));
  if (i < 0) return null;
  const v = lines[i].replace(label, '').replace(/^[:\s-]+/, '').trim();
  return v || null;
}

function sectionAfter(lines: string[], header: RegExp, stop: RegExp, maxLines = 12): string | null {
  const i = lines.findIndex((l) => header.test(l));
  if (i < 0) return null;
  const buf: string[] = [];
  for (let k = i + 1; k < Math.min(lines.length, i + 1 + maxLines); k++) {
    const L = lines[k];
    if (stop.test(L)) break;
    buf.push(L);
  }
  return buf.length ? clean(buf.join(' ')) : null;
}

export function extractHighValueFields(text: string): DocExtraction {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const full = text;

  // Meta
  const tenderNumber = pickAfter(lines, /^tender\s*(number|no\.?|reference)\b[:\s-]*/i)
    || (text.match(/\b(RFQ|RFP|RFB|RFT|RFI|RFA|RFPQ|RFBQ|EOI)[-_\s:/]*([A-Z0-9/\.-]{3,})/i)?.[0] ?? null);
  const title = pickAfter(lines, /^title\b[:\s-]*/i) || null;
  const buyer = pickAfter(lines, /^(buyer|organ\s+of\s+state|department|entity)\b[:\s-]*/i) || null;
  const publishedDate = pickAfter(lines, /^(date\s*published|publication\s*date)\b[:\s-]*/i) || null;

  // Dates
  const briefing = pickAfter(lines, /^briefing\s*(date|date\s*and\s*time)?\b[:\s-]*/i)
    || sectionAfter(lines, /^briefing\s*session\b/i, /^[A-Z][A-Z ]{3,}\b/);
  const enquiriesClose = pickAfter(lines, /^(enquiries|queries)\s*(closing\s*date|deadline|cut-?off)?\b[:\s-]*/i) || null;
  const submissionClose = pickAfter(lines, /^(closing\s*date|submission\s*deadline|closing\s*time)\b[:\s-]*/i) || null;
  const validityPeriod = pickAfter(lines, /^(tender|bid)\s*validity\s*(period)?\b[:\s-]*/i) || null;
  const implementationPeriod = pickAfter(lines, /^(implementation|delivery|contract)\s*(period|duration)\b[:\s-]*/i) || null;

  // Submission
  const method = pickAfter(lines, /^submission\s*method\b[:\s-]*/i)
    || (text.match(/\b(two|one)[- ]envelope\b/i)?.[0] ? 'two-envelope' : null)
    || (text.match(/\be-?submission|email\s+submission|tender\s+box|hand[-\s]?delivery|portal\b/i)?.[0] ?? null);
  const address = pickAfter(lines, /^(submission|delivery)\s*(address|location|venue)\b[:\s-]*/i) || null;
  const subEmail = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ?? null;
  const subUrl = text.match(/https?:\/\/\S+/i)?.[0] ?? null;
  const envelopeSystem = text.match(/\b(two|one)[- ]envelope\b/i)?.[0] ?? null;
  const instructions = sectionAfter(lines, /^(submission\s*instructions|instructions\s*to\s*bidders)\b/i, /^[A-Z][A-Z ]{3,}\b/);
  const lateBidPolicy = sectionAfter(lines, /^late\s*(bids|submissions)\b/i, /^[A-Z][A-Z ]{3,}\b/);

  // Eligibility
  const csd = /\bCSD\b/i.test(text) ? true : null;
  const taxCompliance = /(tax\s*compliance|tax\s*clearance)/i.test(text) ? true : null;
  const cidb = (text.match(/\bCIDB\b[^\n]*?(?:level|grading)?[:\s-]*([A-Z0-9\s\/.-]{1,20})/i)?.[1] ?? null);
  const bbbee = (text.match(/\bB[-\s]?BBEE\b[^\n]*?(?:level)?[:\s-]*([0-9A-Za-z\s\/.-]{1,10})/i)?.[1] ?? null);
  const oem = sectionAfter(lines, /^oem\s*(requirement|authorization)?\b/i, /^[A-Z][A-Z ]{3,}\b/);
  const localContent = sectionAfter(lines, /^(local\s*content|designated\s*sectors)\b/i, /^[A-Z][A-Z ]{3,}\b/);
  const mandatoryBriefing = /mandatory\s+(site\s*)?briefing/i.test(text) ? true : null;
  const otherEligibility = sectionAfter(lines, /^eligibility\b/i, /^[A-Z][A-Z ]{3,}\b/);

  // Evaluation
  const methodEval = (text.match(/\b(80\/20|90\/10)\b/)?.[1] ?? null) || (text.match(/\bPPGFA?\b/i)?.[0] ?? null);
  const functionalityThreshold = (text.match(/functionality[^\n]*?(?:minimum|threshold)[:\s-]*([0-9]{1,3})%/i)?.[1] ?? null);
  const scoringRubric = sectionAfter(lines, /^(evaluation|scoring|functionality)\b/i, /^[A-Z][A-Z ]{3,}\b/);

  // Scope
  const description = sectionAfter(lines, /^(scope\s*of\s*work|project\s*description|requirements)\b/i, /^[A-Z][A-Z ]{3,}\b/);
  const lots = sectionAfter(lines, /^(lots|packages)\b/i, /^[A-Z][A-Z ]{3,}\b/);
  const delivery = sectionAfter(lines, /^(delivery\s*period|implementation\s*period)\b/i, /^[A-Z][A-Z ]{3,}\b/);

  // Commercial
  const pricing = sectionAfter(lines, /^pricing\s*instructions\b/i, /^[A-Z][A-Z ]{3,}\b/);
  const currencyVat = sectionAfter(lines, /^(currency|vat)\b/i, /^[A-Z][A-Z ]{3,}\b/);
  const bidBond = sectionAfter(lines, /^(bid|tender)\s*(security|bond)\b/i, /^[A-Z][A-Z ]{3,}\b/);
  const performanceSecurity = sectionAfter(lines, /^performance\s*security\b/i, /^[A-Z][A-Z ]{3,}\b/);
  const penalties = sectionAfter(lines, /^(penalt(y|ies)|liquidated\s*damages)\b/i, /^[A-Z][A-Z ]{3,}\b/);
  const warranty = sectionAfter(lines, /^warranty\b/i, /^[A-Z][A-Z ]{3,}\b/);
  const sla = sectionAfter(lines, /^service\s*level\s*agreement\b/i, /^[A-Z][A-Z ]{3,}\b/);

  // Contacts
  const enquiries = sectionAfter(lines, /^(enquiries|queries|clarifications)\b/i, /^[A-Z][A-Z ]{3,}\b/) ||
    pickAfter(lines, /^(contact\s*person|enquiries)\b[:\s-]*/i);
  const submissionContact = sectionAfter(lines, /^(submission\s*contact)\b/i, /^[A-Z][A-Z ]{3,}\b/);

  return {
    meta: {
      tenderNumber: ef(tenderNumber),
      title: ef(title),
      buyer: ef(buyer),
      publishedDate: ef(publishedDate),
    },
    dates: {
      briefing: ef(briefing),
      enquiriesClose: ef(enquiriesClose),
      submissionClose: ef(submissionClose),
      validityPeriod: ef(validityPeriod),
      implementationPeriod: ef(implementationPeriod),
    },
    submission: {
      method: ef(method),
      address: ef(address),
      email: ef(subEmail),
      url: ef(subUrl),
      envelopeSystem: ef(envelopeSystem),
      instructions: ef(instructions),
      lateBidPolicy: ef(lateBidPolicy),
    },
    eligibility: {
      csd: ef(csd),
      taxCompliance: ef(taxCompliance),
      cidb: ef(cidb),
      bbbee: ef(bbbee),
      oem: ef(oem),
      localContent: ef(localContent),
      mandatoryBriefing: ef(mandatoryBriefing),
      other: ef(otherEligibility),
    },
    evaluation: {
      method: ef(methodEval),
      functionalityThreshold: ef(functionalityThreshold),
      scoringRubric: ef(scoringRubric),
    },
    scope: {
      description: ef(description),
      lots: ef(lots),
      delivery: ef(delivery),
    },
    commercial: {
      pricing: ef(pricing),
      currencyVat: ef(currencyVat),
      bidBond: ef(bidBond),
      performanceSecurity: ef(performanceSecurity),
      penalties: ef(penalties),
      warranty: ef(warranty),
      sla: ef(sla),
    },
    contacts: {
      enquiries: ef(enquiries),
      submission: ef(submissionContact),
    },
    raw: full,
  };
}

