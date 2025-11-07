/**
 * Municipality data for SEO-optimized municipality pages
 */

export interface Municipality {
  slug: string;
  name: string;
  fullName: string;
  province: string;
  description: string;
  overview: string;
  population?: string;
  website?: string;
  contactInfo?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  supplierRegistration?: {
    url?: string;
    requirements?: string[];
  };
  tenderTypes?: string[];
  beeRequirements?: string;
  keyDepartments?: string[];
  tenderInsights?: string;
}

export const municipalities: Municipality[] = [
  {
    slug: "city-of-johannesburg",
    name: "City of Johannesburg",
    fullName: "City of Johannesburg Metropolitan Municipality",
    province: "Gauteng",
    description: "Find City of Johannesburg municipal tenders, RFQs & RFPs. Access CoJ procurement opportunities, supplier registration, and BEE requirements for Johannesburg tenders 2025.",
    overview: "The City of Johannesburg is South Africa's largest city and economic hub, responsible for billions of rands in annual procurement. The municipality issues tenders across construction, IT services, consulting, goods supply, and infrastructure development. As a Category A metropolitan municipality, CoJ follows strict procurement procedures aligned with the Municipal Finance Management Act (MFMA).",
    population: "5.6 million",
    website: "https://www.joburg.org.za",
    contactInfo: {
      email: "procurement@joburg.org.za",
      phone: "+27 11 407 6111",
      address: "158 Civic Boulevard, Braamfontein, Johannesburg, 2001",
    },
    supplierRegistration: {
      url: "https://www.joburg.org.za/business/supplier-registration",
      requirements: [
        "Valid tax clearance certificate",
        "Company registration documents (CIPC)",
        "B-BBEE certificate (if applicable)",
        "CSD registration",
        "Banking details",
      ],
    },
    tenderTypes: [
      "Construction & Infrastructure",
      "IT Services & Software",
      "Professional Services",
      "Goods Supply",
      "Maintenance & Repairs",
      "Consulting Services",
    ],
    beeRequirements: "Preference points awarded for B-BBEE Level 1-4 suppliers. Local content requirements apply to construction tenders. SMME participation encouraged.",
    keyDepartments: [
      "City Manager's Office",
      "Group Finance",
      "Infrastructure & Services",
      "Development Planning",
      "Public Safety",
      "Environment & Infrastructure Services",
    ],
    tenderInsights: "CoJ typically publishes 200-300 tenders annually, with construction and IT services representing the largest categories. Tender values range from R50,000 to R500 million. Most tenders require 30-60 day submission periods.",
  },
  {
    slug: "city-of-cape-town",
    name: "City of Cape Town",
    fullName: "City of Cape Town Metropolitan Municipality",
    province: "Western Cape",
    description: "Find City of Cape Town municipal tenders, RFQs & RFPs. Access CoCT procurement opportunities, supplier registration, and BEE requirements for Cape Town tenders 2025.",
    overview: "The City of Cape Town is South Africa's second-largest city and a major economic center. The municipality manages extensive procurement across water infrastructure, waste management, public transport, IT systems, and municipal services. CoCT follows transparent procurement processes aligned with MFMA and PPPFA requirements.",
    population: "4.6 million",
    website: "https://www.capetown.gov.za",
    contactInfo: {
      email: "procurement@capetown.gov.za",
      phone: "+27 21 400 9111",
      address: "12 Hertzog Boulevard, Cape Town, 8001",
    },
    supplierRegistration: {
      url: "https://www.capetown.gov.za/work/business/supplier-registration",
      requirements: [
        "Tax clearance certificate",
        "CIPC registration",
        "B-BBEE certificate",
        "CSD registration",
        "VAT registration (if applicable)",
      ],
    },
    tenderTypes: [
      "Water & Sanitation",
      "Waste Management",
      "Public Transport",
      "IT & Digital Services",
      "Construction & Infrastructure",
      "Professional Services",
    ],
    beeRequirements: "B-BBEE Level 1-4 suppliers receive preference points. Local supplier development programs available. SMME participation targeted at 30% of procurement spend.",
    keyDepartments: [
      "City Manager's Office",
      "Finance",
      "Water & Sanitation",
      "Transport & Urban Development",
      "Safety & Security",
      "Energy & Climate Change",
    ],
    tenderInsights: "CoCT publishes 150-250 tenders annually, with water infrastructure and IT services being prominent. Tender values typically range from R100,000 to R1 billion for major infrastructure projects.",
  },
  {
    slug: "ethekwini",
    name: "eThekwini Municipality",
    fullName: "eThekwini Metropolitan Municipality (Durban)",
    province: "KwaZulu-Natal",
    description: "Find eThekwini Municipality tenders, RFQs & RFPs. Access Durban municipal procurement opportunities, supplier registration, and BEE requirements for eThekwini tenders 2025.",
    overview: "eThekwini Municipality (Durban) is South Africa's third-largest city and a major port city. The municipality manages significant procurement across port infrastructure, tourism, water services, housing, and municipal services. eThekwini follows MFMA-compliant procurement processes with emphasis on local economic development.",
    population: "3.7 million",
    website: "https://www.durban.gov.za",
    contactInfo: {
      email: "procurement@durban.gov.za",
      phone: "+27 31 311 1111",
      address: "4th Floor, 166 K.E. Masinga Road, Durban, 4001",
    },
    supplierRegistration: {
      url: "https://www.durban.gov.za/city_services/business/supplier-registration",
      requirements: [
        "Tax clearance certificate",
        "Company registration (CIPC)",
        "B-BBEE certificate",
        "CSD registration",
        "Municipal supplier registration",
      ],
    },
    tenderTypes: [
      "Port Infrastructure",
      "Tourism & Events",
      "Water Services",
      "Housing Development",
      "IT Services",
      "Construction",
    ],
    beeRequirements: "B-BBEE Level 1-4 suppliers preferred. Local content requirements. SMME development programs. Black-owned businesses receive additional preference.",
    keyDepartments: [
      "City Manager's Office",
      "Finance",
      "Water & Sanitation",
      "Housing & Human Settlements",
      "Economic Development",
      "Transport Authority",
    ],
    tenderInsights: "eThekwini publishes 180-280 tenders annually. Port infrastructure and water services represent major procurement categories. Tender values range from R75,000 to R800 million.",
  },
  {
    slug: "city-of-tshwane",
    name: "City of Tshwane",
    fullName: "City of Tshwane Metropolitan Municipality (Pretoria)",
    province: "Gauteng",
    description: "Find City of Tshwane municipal tenders, RFQs & RFPs. Access CoT procurement opportunities, supplier registration, and BEE requirements for Pretoria tenders 2025.",
    overview: "The City of Tshwane is South Africa's administrative capital and fourth-largest city. The municipality manages procurement across government services, infrastructure, IT systems, and municipal operations. CoT follows strict MFMA-compliant procurement aligned with national treasury guidelines.",
    population: "3.3 million",
    website: "https://www.tshwane.gov.za",
    contactInfo: {
      email: "procurement@tshwane.gov.za",
      phone: "+27 12 358 9999",
      address: "320 Madiba Street, Pretoria, 0001",
    },
    supplierRegistration: {
      url: "https://www.tshwane.gov.za/business/supplier-registration",
      requirements: [
        "Tax clearance certificate",
        "CIPC registration",
        "B-BBEE certificate",
        "CSD registration",
      ],
    },
    tenderTypes: [
      "Government Services",
      "Infrastructure Development",
      "IT & Digital Services",
      "Maintenance Services",
      "Professional Services",
      "Goods Supply",
    ],
    beeRequirements: "B-BBEE Level 1-4 suppliers receive preference points. Local supplier development programs. SMME participation encouraged.",
    keyDepartments: [
      "City Manager's Office",
      "Finance",
      "Infrastructure Development",
      "Corporate & Shared Services",
      "Human Settlements",
      "Economic Development",
    ],
    tenderInsights: "CoT publishes 160-240 tenders annually. Government services and infrastructure are key categories. Tender values typically range from R100,000 to R600 million.",
  },
  {
    slug: "ekurhuleni",
    name: "Ekurhuleni Municipality",
    fullName: "Ekurhuleni Metropolitan Municipality",
    province: "Gauteng",
    description: "Find Ekurhuleni Municipality tenders, RFQs & RFPs. Access Ekurhuleni procurement opportunities, supplier registration, and BEE requirements for East Rand tenders 2025.",
    overview: "Ekurhuleni Municipality is a major industrial and manufacturing hub in the East Rand region of Gauteng. The municipality manages procurement across industrial development, infrastructure, housing, water services, and municipal operations. Ekurhuleni emphasizes local economic development and supplier diversity.",
    population: "3.4 million",
    website: "https://www.ekurhuleni.gov.za",
    contactInfo: {
      email: "procurement@ekurhuleni.gov.za",
      phone: "+27 11 999 0000",
      address: "Civic Centre, Germiston, 1401",
    },
    supplierRegistration: {
      url: "https://www.ekurhuleni.gov.za/business/supplier-registration",
      requirements: [
        "Tax clearance certificate",
        "CIPC registration",
        "B-BBEE certificate",
        "CSD registration",
      ],
    },
    tenderTypes: [
      "Industrial Development",
      "Infrastructure",
      "Housing Development",
      "Water Services",
      "IT Services",
      "Maintenance",
    ],
    beeRequirements: "B-BBEE Level 1-4 suppliers preferred. Local economic development focus. SMME and township supplier development programs.",
    keyDepartments: [
      "City Manager's Office",
      "Finance",
      "Infrastructure Services",
      "Human Settlements",
      "Economic Development",
      "Water & Sanitation",
    ],
    tenderInsights: "Ekurhuleni publishes 140-220 tenders annually. Industrial development and infrastructure are major categories. Tender values range from R80,000 to R500 million.",
  },
  {
    slug: "nelson-mandela-bay",
    name: "Nelson Mandela Bay",
    fullName: "Nelson Mandela Bay Metropolitan Municipality (Port Elizabeth)",
    province: "Eastern Cape",
    description: "Find Nelson Mandela Bay municipal tenders, RFQs & RFPs. Access NMB procurement opportunities, supplier registration, and BEE requirements for Port Elizabeth tenders 2025.",
    overview: "Nelson Mandela Bay Metropolitan Municipality is a major port city in the Eastern Cape. The municipality manages procurement across port operations, tourism, infrastructure, water services, and municipal services. NMB follows MFMA-compliant procurement with emphasis on local supplier development.",
    population: "1.2 million",
    website: "https://www.nelsonmandelabay.gov.za",
    contactInfo: {
      email: "procurement@nelsonmandelabay.gov.za",
      phone: "+27 41 506 3111",
      address: "1st Floor, Vuyisile Mini Square, Port Elizabeth, 6001",
    },
    supplierRegistration: {
      url: "https://www.nelsonmandelabay.gov.za/business/supplier-registration",
      requirements: [
        "Tax clearance certificate",
        "CIPC registration",
        "B-BBEE certificate",
        "CSD registration",
      ],
    },
    tenderTypes: [
      "Port Operations",
      "Tourism Development",
      "Infrastructure",
      "Water Services",
      "Housing",
      "IT Services",
    ],
    beeRequirements: "B-BBEE Level 1-4 suppliers receive preference points. Local supplier development programs. SMME participation encouraged.",
    keyDepartments: [
      "City Manager's Office",
      "Finance",
      "Infrastructure & Engineering",
      "Economic Development",
      "Human Settlements",
      "Water & Sanitation",
    ],
    tenderInsights: "NMB publishes 100-180 tenders annually. Port operations and infrastructure are key categories. Tender values typically range from R50,000 to R400 million.",
  },
];

export function getMunicipalityBySlug(slug: string): Municipality | undefined {
  return municipalities.find((m) => m.slug === slug);
}

export function getAllMunicipalitySlugs(): string[] {
  return municipalities.map((m) => m.slug);
}