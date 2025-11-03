export interface Category {
  name: string;
  slug: string;
  description: string;
  icon: string;
  tenderTypes?: string[];
  commonBuyers?: string[];
  averageValues?: string;
  overview?: string;
  requirements?: {
    title: string;
    items: string[];
  };
  keyConsiderations?: string[];
  successTips?: string[];
}

export const categories: Category[] = [
  {
    name: "Construction & Infrastructure",
    slug: "construction",
    description: "Building, roads, bridges, and infrastructure development projects",
    icon: "🏗️",
    averageValues: "R500K - R5M",
    tenderTypes: ["Building Construction", "Road Construction", "Bridge Construction", "Infrastructure Development"],
    overview: "This category includes various procurement opportunities in construction and infrastructure development."
  },
  {
    name: "Information Technology",
    slug: "information-technology",
    description: "Software, hardware, IT services, and digital transformation",
    icon: "💻",
    averageValues: "R500K - R5M",
    tenderTypes: ["Software Development", "IT Hardware", "Cybersecurity", "Digital Transformation"],
    overview: "This category includes various procurement opportunities in information technology and digital services."
  },
  {
    name: "Consulting Services",
    slug: "consulting",
    description: "Professional consulting, advisory, and expert services",
    icon: "📊",
    averageValues: "R500K - R5M",
    tenderTypes: ["Management Consulting", "Technical Consulting", "Financial Consulting", "Strategic Planning"],
    overview: "This category includes various procurement opportunities in consulting and professional services."
  },
  {
    name: "Goods & Supplies",
    slug: "goods",
    description: "Equipment, materials, supplies, and commodities",
    icon: "📦",
    averageValues: "R500K - R5M",
    tenderTypes: ["Office Supplies", "Equipment", "Materials", "Consumables"],
    overview: "This category includes various procurement opportunities for goods and supplies."
  },
  {
    name: "Professional Services",
    slug: "professional-services",
    description: "Legal, financial, engineering, and specialized services",
    icon: "👔",
    averageValues: "R500K - R5M",
    tenderTypes: ["Legal Services", "Engineering Services", "Financial Services", "Audit Services"],
    overview: "This category includes various procurement opportunities for professional and specialized services."
  },
  {
    name: "Healthcare & Medical",
    slug: "healthcare",
    description: "Medical equipment, pharmaceuticals, and healthcare services",
    icon: "🏥",
    averageValues: "R500K - R5M",
    tenderTypes: ["Medical Equipment", "Pharmaceuticals", "Healthcare Services", "Medical Supplies"],
    overview: "This category includes various procurement opportunities in healthcare and medical services."
  },
  {
    name: "Education & Training",
    slug: "education",
    description: "Educational materials, training programs, and learning solutions",
    icon: "📚",
    averageValues: "R500K - R5M",
    tenderTypes: ["Educational Materials", "Training Programs", "Learning Solutions", "Curriculum Development"],
    overview: "This category includes various procurement opportunities in education and training services."
  },
  {
    name: "Transportation & Logistics",
    slug: "transportation",
    description: "Vehicle procurement, logistics, and transportation services",
    icon: "🚚",
    averageValues: "R500K - R5M",
    tenderTypes: ["Vehicle Procurement", "Logistics Services", "Transportation Services", "Fleet Management"],
    overview: "This category includes various procurement opportunities in transportation and logistics."
  }
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find(category => category.slug === slug);
}

export function getAllCategorySlugs(): string[] {
  return categories.map(category => category.slug);
}