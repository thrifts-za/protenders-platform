import { NormalizedTender } from "@/types/tender";

const categories = ["goods", "services", "works"];
const buyers = [
  "Department of Health",
  "Department of Education",
  "Department of Transport",
  "City of Cape Town",
  "Johannesburg Metro",
  "eThekwini Municipality",
  "National Treasury",
  "Department of Public Works",
  "South African Police Service",
  "Department of Defence",
];

const statuses = ["active", "planned", "complete", "cancelled"] as const;
const submissionMethodOptions = ["email", "electronic", "physical", "other"] as const;

// Generate 50 mock tenders with varied data
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mockTenders: NormalizedTender[] = Array.from({ length: 50 }, (_, i) => {
  const daysUntilClose = Math.floor(Math.random() * 60) - 10; // -10 to 50 days
  const closingDate = new Date();
  closingDate.setDate(closingDate.getDate() + daysUntilClose);

  const numMethods = Math.floor(Math.random() * 3) + 1;
  const methods = Array.from(
    { length: numMethods },
    () => submissionMethodOptions[Math.floor(Math.random() * submissionMethodOptions.length)]
  );

  const category = categories[Math.floor(Math.random() * categories.length)];
  const buyer = buyers[Math.floor(Math.random() * buyers.length)];
  const status = statuses[Math.floor(Math.random() * statuses.length)];

  // Generate mock documents (some tenders have them)
  const hasDocuments = Math.random() > 0.3;
  const documents = hasDocuments ? Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, docIdx) => ({
    id: `doc-${i}-${docIdx}`,
    title: `Document ${docIdx + 1} - ${["Terms of Reference", "Specifications", "Bidding Documents", "Contract Template", "FAQ"][docIdx % 5]}`,
    fileName: `doc-${i}-${docIdx}.pdf`,
    dateModified: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000).toISOString(),
    type: "pdf",
    version: docIdx === 0 && Math.random() > 0.7 ? "2.0" : "1.0",
    isUpdated: docIdx === 0 && Math.random() > 0.7,
  })) : [];

  // Generate mock awards (some tenders have them)
  const hasAwards = status === "complete" && Math.random() > 0.4;
  const awards = hasAwards ? Array.from({ length: Math.floor(Math.random() * 2) + 1 }, (_, awardIdx) => ({
    id: `award-${i}-${awardIdx}`,
    date: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
    value: Math.floor(Math.random() * 5000000) + 50000,
    currency: "ZAR",
    suppliers: [{
      id: `supplier-${i}-${awardIdx}`,
      name: ["ABC Construction Ltd", "XYZ Services Pty", "Global Supply Co", "TechPro Solutions", "BuildRight Enterprises"][awardIdx % 5],
    }],
    buyerName: buyer,
    contractPeriod: {
      start: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date(Date.now() + (Math.random() * 365 + 180) * 24 * 60 * 60 * 1000).toISOString(),
    },
  })) : [];

  // Calculate data quality score
  let qualityScore = 0;
  // eslint-disable-next-line no-constant-condition
  if (true) qualityScore += 20; // title always present
  if (buyer) qualityScore += 20;
  if (closingDate) qualityScore += 20;
  if (documents.length > 0) qualityScore += 20;
  if (category) qualityScore += 20;

  // Some tenders have closing date changes
  const hasClosingChange = Math.random() > 0.85;
  const previousClosingDate = hasClosingChange ? new Date(closingDate.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString() : null;

  return {
    id: `tender-${i + 1}`,
    title: `${category === "goods" ? "Supply of" : category === "services" ? "Provision of" : "Construction of"} ${
      category === "goods"
        ? ["Medical Equipment", "Office Furniture", "IT Hardware", "Vehicles", "Catering Services"][i % 5]
        : category === "services"
        ? ["Consulting Services", "Maintenance Services", "Security Services", "Cleaning Services", "Training"][i % 5]
        : ["Building Infrastructure", "Road Maintenance", "Bridge Construction", "Facility Upgrades", "Public Housing"][i % 5]
    } - Reference ${1000 + i}`,
    description: `Detailed procurement requirement for ${category} procurement. This tender involves comprehensive ${
      category === "works" ? "construction and engineering" : category === "goods" ? "supply and delivery" : "service provision"
    } activities. Bidders must meet all specified requirements and submit documentation by the closing date.`,
    buyerName: buyer,
    mainProcurementCategory: category,
    closingDate: closingDate.toISOString(),
    submissionMethods: [...new Set(methods)],
    status,
    documents,
    awards,
    previousClosingDate,
    dataQualityScore: qualityScore,
    raw: {
      ocid: `ocds-abc123-${i + 1}`,
      releaseId: `release-${i + 1}`,
      publishedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      tender: {
        id: `TND-${1000 + i}`,
        status,
        items: [
          {
            id: `item-${i}-1`,
            description: `Primary item for tender ${i + 1}`,
            classification: {
              scheme: "CPV",
              id: `${30000000 + i * 1000}`,
              description: "Various goods and services",
            },
          },
        ],
        value: {
          amount: Math.floor(Math.random() * 10000000) + 100000,
          currency: "ZAR",
        },
      },
      buyer: {
        name: buyer,
        id: `buyer-${buyers.indexOf(buyer)}`,
      },
    },
  };
}) as unknown as NormalizedTender[];
