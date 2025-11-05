/**
 * Department data for SEO-optimized department pages
 */

export interface Department {
  slug: string;
  name: string;
  fullName: string;
  description: string;
  overview: string;
  website?: string;
  contactInfo?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  tenderTypes?: string[];
  beeRequirements?: string;
  keyPrograms?: string[];
  tenderInsights?: string;
}

export const departments: Department[] = [
  {
    slug: "department-of-health",
    name: "Department of Health",
    fullName: "National Department of Health",
    description: "Find Department of Health tenders, RFQs & RFPs. Access healthcare procurement opportunities, medical equipment, pharmaceuticals, and health services tenders in South Africa 2025.",
    overview: "The National Department of Health manages extensive procurement across healthcare services, medical equipment, pharmaceuticals, hospital infrastructure, and health information systems. The department issues tenders for public hospitals, clinics, and health programs across all nine provinces.",
    website: "https://www.health.gov.za",
    contactInfo: {
      email: "procurement@health.gov.za",
      phone: "+27 12 395 8000",
      address: "Civitas Building, 222 Struben Street, Pretoria, 0001",
    },
    tenderTypes: [
      "Medical Equipment",
      "Pharmaceuticals",
      "Healthcare Services",
      "Hospital Infrastructure",
      "Health IT Systems",
      "Medical Supplies",
    ],
    beeRequirements: "B-BBEE Level 1-4 suppliers preferred. Local pharmaceutical manufacturing encouraged. Medical device suppliers must meet SAHPRA requirements.",
    keyPrograms: [
      "Primary Healthcare",
      "Hospital Services",
      "HIV/AIDS Programs",
      "TB Control",
      "Maternal & Child Health",
      "Health Information Systems",
    ],
    tenderInsights: "The Department of Health publishes 100-200 tenders annually. Medical equipment and pharmaceuticals represent major procurement categories. Tender values typically range from R500,000 to R2 billion for large infrastructure projects.",
  },
  {
    slug: "department-of-education",
    name: "Department of Education",
    fullName: "Department of Basic Education",
    description: "Find Department of Education tenders, RFQs & RFPs. Access education procurement opportunities, school infrastructure, learning materials, and education services tenders in South Africa 2025.",
    overview: "The Department of Basic Education manages procurement across school infrastructure, learning materials, textbooks, educational technology, school furniture, and education services. The department issues tenders for public schools and education programs nationwide.",
    website: "https://www.education.gov.za",
    contactInfo: {
      email: "procurement@education.gov.za",
      phone: "+27 12 357 3000",
      address: "222 Struben Street, Pretoria, 0001",
    },
    tenderTypes: [
      "School Infrastructure",
      "Learning Materials",
      "Textbooks",
      "Educational Technology",
      "School Furniture",
      "Education Services",
    ],
    beeRequirements: "B-BBEE Level 1-4 suppliers preferred. Local content requirements for textbooks. SMME participation encouraged in infrastructure projects.",
    keyPrograms: [
      "School Infrastructure Program",
      "Textbook Provision",
      "ICT in Education",
      "Nutrition Programs",
      "Teacher Development",
      "Early Childhood Development",
    ],
    tenderInsights: "The Department of Education publishes 80-150 tenders annually. School infrastructure and textbooks are major categories. Tender values range from R200,000 to R1.5 billion for infrastructure projects.",
  },
  {
    slug: "department-of-public-works",
    name: "Department of Public Works",
    fullName: "Department of Public Works and Infrastructure",
    description: "Find Department of Public Works tenders, RFQs & RFPs. Access infrastructure procurement opportunities, construction projects, building maintenance, and public works tenders in South Africa 2025.",
    overview: "The Department of Public Works and Infrastructure manages extensive procurement across government building construction, infrastructure development, maintenance services, property management, and public works projects. The department is responsible for government property portfolio management.",
    website: "https://www.publicworks.gov.za",
    contactInfo: {
      email: "procurement@publicworks.gov.za",
      phone: "+27 12 406 2000",
      address: "CGO Building, 256 Madiba Street, Pretoria, 0001",
    },
    tenderTypes: [
      "Construction Projects",
      "Building Maintenance",
      "Infrastructure Development",
      "Property Management",
      "Professional Services",
      "Building Materials",
    ],
    beeRequirements: "B-BBEE Level 1-4 suppliers preferred. CIDB registration required for construction. Local content requirements. SMME and township supplier development programs.",
    keyPrograms: [
      "Infrastructure Investment Program",
      "Government Property Management",
      "Expanded Public Works Program",
      "Maintenance Services",
      "Green Building Initiatives",
      "Rural Infrastructure",
    ],
    tenderInsights: "The Department of Public Works publishes 150-250 tenders annually. Construction and maintenance are major categories. Tender values typically range from R1 million to R5 billion for major infrastructure projects.",
  },
  {
    slug: "department-of-transport",
    name: "Department of Transport",
    fullName: "Department of Transport",
    description: "Find Department of Transport tenders, RFQs & RFPs. Access transport procurement opportunities, road infrastructure, public transport, and transport services tenders in South Africa 2025.",
    overview: "The Department of Transport manages procurement across road infrastructure, public transport systems, transport equipment, traffic management systems, and transport services. The department issues tenders for national and provincial transport infrastructure projects.",
    website: "https://www.transport.gov.za",
    contactInfo: {
      email: "procurement@transport.gov.za",
      phone: "+27 12 309 3000",
      address: "159 Forum Building, Struben Street, Pretoria, 0001",
    },
    tenderTypes: [
      "Road Infrastructure",
      "Public Transport",
      "Transport Equipment",
      "Traffic Management",
      "Transport Services",
      "Road Maintenance",
    ],
    beeRequirements: "B-BBEE Level 1-4 suppliers preferred. CIDB registration required for construction. Local content requirements. SMME participation encouraged.",
    keyPrograms: [
      "Road Infrastructure Development",
      "Public Transport Modernization",
      "Road Safety Programs",
      "Traffic Management Systems",
      "Rural Transport Access",
      "Transport Planning",
    ],
    tenderInsights: "The Department of Transport publishes 120-200 tenders annually. Road infrastructure and public transport are major categories. Tender values typically range from R500,000 to R3 billion for major infrastructure projects.",
  },
  {
    slug: "department-of-defence",
    name: "Department of Defence",
    fullName: "Department of Defence and Military Veterans",
    description: "Find Department of Defence tenders, RFQs & RFPs. Access defence procurement opportunities, military equipment, security services, and defence-related tenders in South Africa 2025.",
    overview: "The Department of Defence manages procurement across military equipment, defence systems, security services, military infrastructure, and defence-related services. The department issues tenders for the South African National Defence Force (SANDF).",
    website: "https://www.dod.mil.za",
    contactInfo: {
      email: "procurement@dod.mil.za",
      phone: "+27 12 355 6321",
      address: "Defence Headquarters, Armscor Building, Potgieter Street, Pretoria, 0001",
    },
    tenderTypes: [
      "Military Equipment",
      "Defence Systems",
      "Security Services",
      "Military Infrastructure",
      "Defence Services",
      "Military Supplies",
    ],
    beeRequirements: "B-BBEE Level 1-4 suppliers preferred. Strategic defence procurement regulations apply. Local defence industry development encouraged.",
    keyPrograms: [
      "Defence Capability Acquisition",
      "Military Infrastructure",
      "Defence Industry Development",
      "Peacekeeping Support",
      "Border Security",
      "Defence Technology",
    ],
    tenderInsights: "The Department of Defence publishes 50-120 tenders annually. Military equipment and infrastructure are major categories. Tender values typically range from R1 million to R10 billion for major defence acquisitions.",
  },
];

export function getDepartmentBySlug(slug: string): Department | undefined {
  return departments.find((d) => d.slug === slug);
}

export function getAllDepartmentSlugs(): string[] {
  return departments.map((d) => d.slug);
}