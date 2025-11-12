/**
 * Corporate ESD Funding Programs Seed File
 * Phase 3: ProTender Fund Finder
 *
 * Data Source: MSME Funding Handbook Volume 4 - Corporate ESD Funds (2023)
 * Total Programs: 47 funding opportunities from 30+ corporate institutions
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate URL-friendly slug
 */
function generateSlug(institution: string, programName: string): string {
  const instSlug = institution
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const programSlug = programName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  return `${instSlug}-${programSlug}`;
}

/**
 * Build searchable text
 */
function buildSearchableText(program: any): string {
  const parts: string[] = [
    program.institution || '',
    program.programName || '',
    program.sector || '',
    program.fundingType || '',
    program.purpose || '',
    ...(program.fundedIndustries || []),
    ...(program.eligibility || []),
    ...(program.categories || []),
  ];

  return parts.filter(Boolean).join(' ').toLowerCase();
}

/**
 * Normalize provinces
 */
function normalizeProvinces(provinces?: string[]): string[] {
  if (!provinces || provinces.length === 0 || provinces.includes('All Provinces')) {
    return [
      'Eastern Cape',
      'Free State',
      'Gauteng',
      'KwaZulu-Natal',
      'Limpopo',
      'Mpumalanga',
      'Northern Cape',
      'North West',
      'Western Cape'
    ];
  }
  return provinces;
}

/**
 * Convert amount string to cents (BigInt)
 */
function amountToCents(amount: number): bigint {
  return BigInt(Math.floor(amount * 100));
}

// ============================================================================
// CORPORATE ESD FUNDING PROGRAMS DATA
// ============================================================================

const corporateESDPrograms = [
  // ========== CONSTRUCTION ==========
  {
    institution: 'Barloworld',
    programName: 'Siyakhula Enterprise and Supplier Development Programme',
    slug: '', // Will be generated
    fundingType: 'Hybrid',
    purpose: 'Provides development support to MSMEs operating within or seeking to operate within Barloworld\'s value chain in South Africa',
    minAmount: null,
    maxAmount: null,
    amountNotes: 'Interest-free loans with 6-month payment holidays and grants available',
    categories: ['Construction', 'Supply Chain Development'],
    provinces: [], // All provinces
    fundedIndustries: ['Construction', 'Equipment', 'Services'],
    eligibility: [
      'Businesses registered and operating in South Africa',
      'Annual turnover below R50m with 51%+ black ownership',
      'Black women ownership of 30%+ preferred',
      'Youth ownership preferred',
      'Customers or suppliers to Barloworld'
    ],
    applyUrl: 'https://www.barloworldsiyakhula.com/work-with-us.php',
    contactEmail: null,
    contactPhone: null,
    website: 'https://www.barloworldsiyakhula.com',
    applicationMethod: 'Online application through website. Note: Application period has ended, follow social media for future calls.',
    submissionRequirements: [],
    fundingCategory: 'Corporate ESD',
    parentInstitution: 'Barloworld',
    sector: 'Construction',
    source: 'corporate_esd',
    isActive: false // Application period ended
  },

  // ========== FINANCIAL SERVICES ==========
  {
    institution: 'ASISA',
    programName: 'ASISA ESD Fund',
    slug: '',
    fundingType: 'Hybrid',
    purpose: 'Industry-wide ESD fund supporting SMEs that are existing suppliers or have strong potential to be suppliers to the insurance and investment industries',
    minAmount: amountToCents(1000000),
    maxAmount: amountToCents(30000000),
    amountNotes: 'R1 million to R30 million',
    categories: ['Financial Services', 'Technology', 'Green Economy'],
    provinces: [],
    fundedIndustries: ['Electronic Equipment', 'Green Economy', 'Motor Body Repair', 'Construction', 'Financial Services', 'Technology', 'Insurtech', 'Healthtech'],
    eligibility: [
      'Majority black-owned SMEs',
      'High growth potential businesses',
      'Supply chain alignment with insurance/investment industry',
      'Differentiated competitive advantage'
    ],
    applyUrl: 'https://www.asisa.org.za/esd/resources/asisa-esd-apply-for-funding-form/',
    website: 'https://www.asisa.org.za',
    applicationMethod: 'Online application form',
    submissionRequirements: [],
    fundingCategory: 'Corporate ESD',
    parentInstitution: 'ASISA',
    sector: 'Financial Services',
    source: 'corporate_esd',
    isActive: true
  },

  // FNB Vumela 3.0 - Purchase Order Finance
  {
    institution: 'FNB Vumela Fund',
    programName: 'Vumela 3.0 - Purchase Order Finance',
    slug: '',
    fundingType: 'Loan',
    purpose: 'Purchase order finance for majority black-owned businesses operating in FirstRand\'s supply chain',
    minAmount: amountToCents(300000),
    maxAmount: amountToCents(5000000),
    amountNotes: 'R300k to R5m, 0-6 months term',
    categories: ['Supply Chain Finance', 'Working Capital'],
    provinces: [],
    fundedIndustries: ['All sectors'],
    eligibility: [
      'Majority black-owned businesses',
      'Turnover less than R50m',
      'Operating in FirstRand supply chain',
      'Revenue R0-R50m',
      'Very early to late growth stage'
    ],
    applyUrl: 'https://vumelafund.com/apply-for-funding-v3/',
    website: 'https://vumelafund.com',
    applicationMethod: 'Online application',
    submissionRequirements: [],
    fundingCategory: 'Corporate ESD',
    parentInstitution: 'FNB',
    sector: 'Financial Services',
    source: 'corporate_esd',
    isActive: true
  },

  // FNB Vumela 3.0 - Supply Chain Debt Finance
  {
    institution: 'FNB Vumela Fund',
    programName: 'Vumela 3.0 - Supply Chain Debt Finance',
    slug: '',
    fundingType: 'Loan',
    purpose: 'Debt finance for capex, working capital, or opex for businesses with supplier contracts in FirstRand\'s supply chain',
    minAmount: amountToCents(1000000),
    maxAmount: amountToCents(10000000),
    amountNotes: 'R1m to R10m, 3-5 years term',
    categories: ['Supply Chain Finance', 'Capex'],
    provinces: [],
    fundedIndustries: ['All sectors'],
    eligibility: [
      'Majority black-owned businesses',
      'Turnover less than R50m',
      'Revenue R5-50m',
      'Early-stage growth phase',
      'Businesses with supplier contracts'
    ],
    applyUrl: 'https://vumelafund.com/apply-for-funding-v3/',
    website: 'https://vumelafund.com',
    applicationMethod: 'Online application',
    submissionRequirements: [],
    fundingCategory: 'Corporate ESD',
    parentInstitution: 'FNB',
    sector: 'Financial Services',
    source: 'corporate_esd',
    isActive: true
  },

  // FNB Vumela 3.0 - Transformation Equity Finance
  {
    institution: 'FNB Vumela Fund',
    programName: 'Vumela 3.0 - Transformation Equity Finance',
    slug: '',
    fundingType: 'Equity',
    purpose: 'Shareholder buy-outs for mature businesses seeking transformation',
    minAmount: amountToCents(10000000),
    maxAmount: amountToCents(30000000),
    amountNotes: 'R10m to R30m, 5 years term',
    categories: ['BEE Transformation', 'Equity'],
    provinces: [],
    fundedIndustries: ['All sectors'],
    eligibility: [
      'Majority black-owned businesses',
      'Turnover less than R50m',
      'Revenue >R20m',
      'Mature businesses seeking transformation'
    ],
    applyUrl: 'https://vumelafund.com/apply-for-funding-v3/',
    website: 'https://vumelafund.com',
    applicationMethod: 'Online application',
    submissionRequirements: [],
    fundingCategory: 'Corporate ESD',
    parentInstitution: 'FNB',
    sector: 'Financial Services',
    source: 'corporate_esd',
    isActive: true
  },

  // FNB Vumela 3.0 - Growth Equity Finance
  {
    institution: 'FNB Vumela Fund',
    programName: 'Vumela 3.0 - Growth Equity Finance',
    slug: '',
    fundingType: 'Equity',
    purpose: 'Equity for capex, working capital, or opex for businesses in Education, Healthcare, Digital Inclusion, and Green Economy sectors',
    minAmount: amountToCents(10000000),
    maxAmount: amountToCents(40000000),
    amountNotes: 'R10m to R40m, 5-6 years term',
    categories: ['Education', 'Healthcare', 'Technology', 'Green Economy'],
    provinces: [],
    fundedIndustries: ['Education', 'Healthcare', 'Digital Inclusion', 'Green Economy'],
    eligibility: [
      'Majority black-owned businesses',
      'Turnover less than R50m',
      'Revenue >=R5m',
      'Cash flow positive or approaching profitability'
    ],
    applyUrl: 'https://vumelafund.com/apply-for-funding-v3/',
    website: 'https://vumelafund.com',
    applicationMethod: 'Online application',
    submissionRequirements: [],
    fundingCategory: 'Corporate ESD',
    parentInstitution: 'FNB',
    sector: 'Financial Services',
    source: 'corporate_esd',
    isActive: true
  },

  // FNB Vumela 4.0 - Venture Debt
  {
    institution: 'FNB Vumela Fund',
    programName: 'Vumela 4.0 - Venture Debt',
    slug: '',
    fundingType: 'Loan',
    purpose: 'Venture debt for tech-driven high growth scale-ups raising Series A or B funding',
    minAmount: null,
    maxAmount: null,
    amountNotes: '3-5 year loan term with 0%-15% interest',
    categories: ['Technology', 'Venture Capital', 'Scale-up'],
    provinces: [],
    fundedIndustries: ['Technology', 'Venture Capital'],
    eligibility: [
      'Majority black-owned businesses',
      'Revenue +R15m p.a. and less than R50m p.a.',
      'Tech-driven high growth potential scale-ups',
      'Currently raising Series A or B round',
      'Venture capital-backed companies'
    ],
    applyUrl: 'https://vumelafund.com/apply-for-funding-v4/',
    website: 'https://vumelafund.com',
    applicationMethod: 'Online application',
    submissionRequirements: [],
    fundingCategory: 'Corporate ESD',
    parentInstitution: 'FNB',
    sector: 'Financial Services',
    source: 'corporate_esd',
    isActive: true
  },

  // FNB Accelerate Loan
  {
    institution: 'FNB Vumela Fund',
    programName: 'Accelerate Loan for Early-Stage Businesses',
    slug: '',
    fundingType: 'Loan',
    purpose: 'Rapidly accessible funding for early-stage/seed businesses in enterprise development programmes',
    minAmount: amountToCents(100000),
    maxAmount: amountToCents(2000000),
    amountNotes: 'R100k to R2m, 3-month to 3-year term, 5% interest (reducible to 0%)',
    categories: ['Early-Stage', 'Seed Funding'],
    provinces: [],
    fundedIndustries: ['All sectors'],
    eligibility: [
      'Majority black-owned businesses',
      'Revenue +R1m p.a. and less than R50m p.a.',
      'Participant in ESD programme sponsored by FNB or managed by Edge Growth'
    ],
    applyUrl: 'https://vumelafund.com',
    website: 'https://vumelafund.com',
    applicationMethod: 'Through Edge Growth or FNB ESD programme',
    submissionRequirements: [],
    fundingCategory: 'Corporate ESD',
    parentInstitution: 'FNB',
    sector: 'Financial Services',
    source: 'corporate_esd',
    isActive: true
  },

  // JP Morgan Abadali Fund
  {
    institution: 'JP Morgan',
    programName: 'Abadali Black Business Growth Fund',
    slug: '',
    fundingType: 'Loan',
    purpose: 'Debt financing on flexible terms to black enterprises in Industrial and Green Economy sectors',
    minAmount: amountToCents(250000),
    maxAmount: null,
    amountNotes: 'Short-term finance from R250,000+, Medium to long-term for businesses with R1m+ revenue',
    categories: ['Manufacturing', 'Green Economy', 'Industrial'],
    provinces: [],
    fundedIndustries: ['Industrial', 'Green Economy', 'Manufacturing'],
    eligibility: [
      'Exempted micro enterprises (annual turnover ≤R10 million)',
      'Qualifying small enterprises (annual turnover >R10 million)',
      'Large entities with at least 51% black ownership',
      'Where possible, majority of black staff members'
    ],
    applyUrl: 'https://www.jpmorgan.com/ZA/en/abadali-eeip',
    website: 'https://www.jpmorgan.com/ZA/en/abadali-eeip',
    applicationMethod: 'Application form available at website',
    submissionRequirements: [],
    fundingCategory: 'Corporate ESD',
    parentInstitution: 'JP Morgan',
    sector: 'Financial Services',
    source: 'corporate_esd',
    isActive: true
  },

  // JP Morgan Abadali Grant
  {
    institution: 'JP Morgan',
    programName: 'Abadali Grant Programme',
    slug: '',
    fundingType: 'Grant',
    purpose: 'R40 million in grants to majority black-owned and controlled enterprises over 8 years',
    minAmount: null,
    maxAmount: null,
    amountNotes: 'R40 million total fund distributed over 8 years',
    categories: ['Manufacturing', 'Green Economy', 'Industrial'],
    provinces: [],
    fundedIndustries: ['Industrial', 'Green Economy'],
    eligibility: [
      'Majority black-owned and controlled enterprises',
      'Operating in Industrial and Green Economy sectors'
    ],
    applyUrl: 'https://www.jpmorgan.com/ZA/en/abadali-eeip',
    website: 'https://www.jpmorgan.com/ZA/en/abadali-eeip',
    applicationMethod: 'Through strategic partners',
    submissionRequirements: [],
    fundingCategory: 'Corporate ESD',
    parentInstitution: 'JP Morgan',
    sector: 'Financial Services',
    source: 'corporate_esd',
    isActive: true
  },

  // Old Mutual Masisizane - Development Financing
  {
    institution: 'Old Mutual',
    programName: 'Masisizane Development Financing',
    slug: '',
    fundingType: 'Loan',
    purpose: 'Development financing for businesses less than 5 years old in rural, township, or peri-urban areas',
    minAmount: amountToCents(250000),
    maxAmount: amountToCents(10000000),
    amountNotes: 'R250,000 to R10 million',
    categories: ['Early-Stage', 'Rural Development', 'Township Economy'],
    provinces: [],
    fundedIndustries: ['All sectors except alcohol and sin industries'],
    eligibility: [
      'At least 51% black-owned and controlled',
      'Officially registered with SARS and tax compliant',
      'Business existence less than 5 years',
      'Business activities in rural, township, or peri-urban area',
      'At least one shareholder 100% operationally involved',
      'Requires end-to-end business support'
    ],
    applyUrl: 'https://www.oldmutual.co.za/business/solutions/masisizane/',
    website: 'https://www.oldmutual.co.za',
    applicationMethod: 'Online application through website',
    submissionRequirements: [],
    fundingCategory: 'Corporate ESD',
    parentInstitution: 'Old Mutual',
    sector: 'Financial Services',
    source: 'corporate_esd',
    isActive: true
  },

  // Old Mutual Masisizane - Commercial Financing
  {
    institution: 'Old Mutual',
    programName: 'Masisizane Commercial Financing',
    slug: '',
    fundingType: 'Loan',
    purpose: 'Commercial financing for businesses more than 5 years old requiring minimal business support',
    minAmount: amountToCents(250000),
    maxAmount: amountToCents(20000000),
    amountNotes: 'R250,000 to R20 million',
    categories: ['Growth Capital', 'Established Business'],
    provinces: [],
    fundedIndustries: ['All sectors except alcohol and sin industries'],
    eligibility: [
      'At least 51% black-owned and controlled',
      'Officially registered with SARS and tax compliant',
      'Business existence more than 5 years',
      'Business activities in rural, township, peri-urban, or urban areas',
      'Management involved full-time in one business',
      'Requires minimal business support'
    ],
    applyUrl: 'https://www.oldmutual.co.za/business/solutions/masisizane/',
    website: 'https://www.oldmutual.co.za',
    applicationMethod: 'Online application through website',
    submissionRequirements: [],
    fundingCategory: 'Corporate ESD',
    parentInstitution: 'Old Mutual',
    sector: 'Financial Services',
    source: 'corporate_esd',
    isActive: true
  },

  // ========== FMCG ==========
  {
    institution: 'PepsiCo',
    programName: 'Kgodiso Development Fund',
    slug: '',
    fundingType: 'Hybrid',
    purpose: 'Empowers black farmers through funding, business development, and increased market access across PepsiCo\'s value chain',
    minAmount: null,
    maxAmount: null,
    amountNotes: 'Funding for sustainable crop production and technical support',
    categories: ['Agriculture', 'Farming', 'Supply Chain'],
    provinces: [],
    fundedIndustries: ['Agriculture', 'Applied R&D', 'Climate Resilient Crops', 'STEM', 'Circular Economy', 'Nutrition Science'],
    eligibility: [
      'Black South African farmers',
      'Suppliers to PepsiCo',
      'Business solution providers',
      'Distributors',
      'Youth-led enterprises',
      'Women-led enterprises'
    ],
    contactEmail: 'info@kgodisofund.co.za',
    website: null,
    applicationMethod: 'Contact via email',
    submissionRequirements: [],
    fundingCategory: 'Corporate ESD',
    parentInstitution: 'PepsiCo',
    sector: 'FMCG',
    source: 'corporate_esd',
    isActive: true
  },

  {
    institution: 'SAB',
    programName: 'Thrive Fund',
    slug: '',
    fundingType: 'Equity',
    purpose: 'R300m Supplier Development and Transformation Fund to invest and transform suppliers within SAB supply chain',
    minAmount: null,
    maxAmount: null,
    amountNotes: 'Growth equity capital, amounts vary',
    categories: ['Supply Chain', 'BEE Transformation'],
    provinces: [],
    fundedIndustries: ['Brewing Materials', 'Marketing & Sales', 'Supply Chain & Logistics', 'Packaging Materials', 'Professional Business Services'],
    eligibility: [
      'Black-owned or white-owned supplier to SAB',
      'Total turnover less than R50 million',
      'Supplier has vendor number with SAB',
      'Black-owned looking to expand or white-owned looking to transform B-BBEE ownership'
    ],
    website: null,
    applicationMethod: 'Through Awethu Project',
    submissionRequirements: [],
    fundingCategory: 'Corporate ESD',
    parentInstitution: 'SAB',
    sector: 'FMCG',
    source: 'corporate_esd',
    isActive: true
  },

  {
    institution: 'Tiger Brands',
    programName: 'Dipuno Enterprise and Supplier Development Fund',
    slug: '',
    fundingType: 'Loan',
    purpose: 'R100 million fund by 2025 for black-owned small enterprises and smallholder farmers in the food value chain',
    minAmount: null,
    maxAmount: null,
    amountNotes: 'Low-interest debt financing',
    categories: ['Agriculture', 'Food Production', 'Supply Chain'],
    provinces: [],
    fundedIndustries: ['Agriculture', 'Food Value Chain', 'Farming'],
    eligibility: [
      'Historically disadvantaged developing farmers',
      'Small suppliers of inputs for Tiger Brands',
      'Black-owned direct and indirect suppliers',
      'Black smallholder farming enterprises',
      'Black distributors with Tiger Brands procurement opportunities'
    ],
    applyUrl: 'https://www.nurturinglives.co.za',
    website: 'https://www.nurturinglives.co.za',
    applicationMethod: 'Online application',
    submissionRequirements: [],
    fundingCategory: 'Corporate ESD',
    parentInstitution: 'Tiger Brands',
    sector: 'FMCG',
    source: 'corporate_esd',
    isActive: true
  },

  // ========== FORESTRY ==========
  {
    institution: 'Mondi',
    programName: 'Zimele Fund',
    slug: '',
    fundingType: 'Loan',
    purpose: 'Business development support and loans to small businesses within Mondi value chain with employment creation potential',
    minAmount: null,
    maxAmount: amountToCents(2000000),
    amountNotes: 'Loans up to R2 million at preferential interest rates',
    categories: ['Forestry', 'Supply Chain', 'Rural Development'],
    provinces: [],
    fundedIndustries: ['Forestry', 'Wood Processing', 'Services'],
    eligibility: [
      'Commercially viable businesses',
      'Registered and compliant with SARS and UIF',
      'Business and Entrepreneur viability',
      'Job sustainability impact',
      'Strategic alignment with Mondi\'s long-term goals'
    ],
    website: null,
    applicationMethod: 'Contact business development manager responsible for your area',
    submissionRequirements: [
      'Comprehensive business plan on Mondi Zimele template',
      'Business opportunity identification',
      'Confirmation of meeting key funding criteria'
    ],
    fundingCategory: 'Corporate ESD',
    parentInstitution: 'Mondi',
    sector: 'Forestry',
    source: 'corporate_esd',
    isActive: true
  },

  // ========== HOSPITALITY ==========
  {
    institution: 'Sun International',
    programName: 'ESD Fund',
    slug: '',
    fundingType: 'Hybrid',
    purpose: 'Enterprise and Supplier Development funding for youth-owned enterprises serving the hospitality industry',
    minAmount: null,
    maxAmount: null,
    amountNotes: 'Amounts vary based on business needs',
    categories: ['Hospitality', 'Tourism', 'Youth Development'],
    provinces: [],
    fundedIndustries: ['Event Planning', 'Decor', 'Branding', 'Food Distribution', 'Liquor Distribution', 'Maintenance', 'Construction', 'Plumbing', 'Electrical'],
    eligibility: [
      'South African registered business (EME/QSE > 51% black ownership)',
      'Demonstrated business acumen',
      'Business in existence for minimum of two years (start-ups also considered)',
      'Start-ups with offtake agreement or long-term contract viewed favorably'
    ],
    contactEmail: 'procurement@suninternational.com',
    applyUrl: 'https://corporate.suninternational.com/procurement/enterprise-supplier-development/online-application/',
    website: 'https://corporate.suninternational.com',
    applicationMethod: 'Email or online application',
    submissionRequirements: [
      'Business proposal (including financial forecast)',
      'Certified copies of ID (all shareholders)',
      'Business registration documents',
      'B-BBEE Certificate',
      'Audited financials, minimum two years',
      'VAT Certificate, if applicable'
    ],
    fundingCategory: 'Corporate ESD',
    parentInstitution: 'Sun International',
    sector: 'Hospitality',
    source: 'corporate_esd',
    isActive: true
  },

  // ========== ICT ==========
  {
    institution: 'MultiChoice',
    programName: 'Innovation Fund - Loans',
    slug: '',
    fundingType: 'Loan',
    purpose: 'Loan financing for black-owned businesses in film, television, media, and ICT sector with focus on innovation',
    minAmount: null,
    maxAmount: amountToCents(50000000),
    amountNotes: 'Loans capped at R50 million',
    categories: ['ICT', 'Media', 'Technology', 'Innovation'],
    provinces: [],
    fundedIndustries: ['Broadcast Technology', 'Content Innovation', 'Digital Solutions', 'Internet', 'Business Processing', 'FinTech', 'Tech'],
    eligibility: [
      'South African entrepreneurs',
      'Start-ups and businesses with annual turnover between 0 and R50 million',
      'At least 51% black ownership',
      'Solutions with job creation potential',
      'Positive community impact',
      'Viable business model'
    ],
    applyUrl: 'https://multichoice.xasafrica.com/login',
    contactEmail: 'innovationfund@multichoice.co.za',
    website: 'https://www.multichoice.com/innovation-fund/',
    applicationMethod: 'Online application portal',
    submissionRequirements: [],
    fundingCategory: 'Corporate ESD',
    parentInstitution: 'MultiChoice',
    sector: 'ICT',
    source: 'corporate_esd',
    isActive: true
  },

  {
    institution: 'MultiChoice',
    programName: 'Innovation Fund - Grants',
    slug: '',
    fundingType: 'Grant',
    purpose: 'Grant financing for black-owned businesses in film, television, media, and ICT sector with focus on innovation',
    minAmount: null,
    maxAmount: amountToCents(1000000),
    amountNotes: 'Grants capped at R1 million',
    categories: ['ICT', 'Media', 'Technology', 'Innovation'],
    provinces: [],
    fundedIndustries: ['Broadcast Technology', 'Content Innovation', 'Digital Solutions', 'Internet', 'Business Processing', 'FinTech', 'Tech'],
    eligibility: [
      'South African entrepreneurs',
      'Start-ups and businesses with annual turnover between 0 and R50 million',
      'At least 51% black ownership',
      'Solutions with job creation potential',
      'Positive community impact',
      'Viable business model'
    ],
    applyUrl: 'https://multichoice.xasafrica.com/login',
    contactEmail: 'innovationfund@multichoice.co.za',
    website: 'https://www.multichoice.com/innovation-fund/',
    applicationMethod: 'Online application portal',
    submissionRequirements: [],
    fundingCategory: 'Corporate ESD',
    parentInstitution: 'MultiChoice',
    sector: 'ICT',
    source: 'corporate_esd',
    isActive: true
  },

  {
    institution: 'MTN & DSBD',
    programName: 'National Gazelles Programme',
    slug: '',
    fundingType: 'Grant',
    purpose: 'R1-million growth grant plus business development support for high-potential MSMEs, initially focused on ICT sector',
    minAmount: amountToCents(1000000),
    maxAmount: amountToCents(1000000),
    amountNotes: 'R1 million growth grant for equipment and capacity-building',
    categories: ['ICT', 'Technology', 'High-Growth'],
    provinces: [],
    fundedIndustries: ['ICT', 'Technology'],
    eligibility: [
      'In business for at least two years',
      'Turnover of at least R1-million',
      'At least two full-time employees'
    ],
    website: null,
    applicationMethod: 'Annual call for applications, selection by public and private sector partners',
    submissionRequirements: [],
    fundingCategory: 'Corporate ESD',
    parentInstitution: 'MTN',
    sector: 'ICT',
    source: 'corporate_esd',
    isActive: true
  },

  {
    institution: 'Telkom',
    programName: 'FutureMakers Fund',
    slug: '',
    fundingType: 'Hybrid',
    purpose: 'Financial empowerment and growth enablement for technology enterprises in Telkom value chain and broader tech sector',
    minAmount: null,
    maxAmount: null,
    amountNotes: 'Expansion capital, growth capital, start-up funding, and equity available',
    categories: ['ICT', 'Technology', 'Media', 'E-Commerce'],
    provinces: [],
    fundedIndustries: ['ICT', 'Services', 'Media', 'E-commerce', 'Education', 'Construction', 'Manufacturing', 'Agriculture', 'Health', 'Retail'],
    eligibility: [
      'Existing suppliers to Telkom',
      'Potential suppliers',
      'General technology sector businesses'
    ],
    contactEmail: 'FutureFund@idf.co.za',
    contactPhone: '0861 433 163',
    website: null,
    applicationMethod: 'Email or phone contact',
    submissionRequirements: [],
    fundingCategory: 'Corporate ESD',
    parentInstitution: 'Telkom',
    sector: 'ICT',
    source: 'corporate_esd',
    isActive: true
  },

  // ========== MANUFACTURING ==========
  {
    institution: 'Automotive Industry',
    programName: 'AITF - Automotive Industry Transformation Fund',
    slug: '',
    fundingType: 'Hybrid',
    purpose: 'Large-scale black entrepreneurial development in automotive sector through equity and loan transactions',
    minAmount: amountToCents(1000000),
    maxAmount: null,
    amountNotes: 'Minimum R1 million, preference for R50 million average transactions',
    categories: ['Manufacturing', 'Automotive', 'BEE Transformation'],
    provinces: [],
    fundedIndustries: ['Automotive Manufacturing', 'Component Manufacturing', 'Logistics', 'Distribution', 'Wholesale', 'Retail', 'Aftermarket', 'Mobility Services'],
    eligibility: [
      'Minimum requirement of R1 million for funding',
      'Black ownership of at least 51%',
      'EMEs, QSEs, and Generic Enterprises with 51% black ownership',
      'Primary business operations within South Africa\'s automotive value chain',
      'No re-financing of assets or loans'
    ],
    website: 'https://autofund.co.za/',
    applicationMethod: 'Contact one of 7 OEMs directly (BMW, Ford, Isuzu, Mercedes-Benz, Nissan, Toyota, Volkswagen)',
    submissionRequirements: [],
    fundingCategory: 'Corporate ESD',
    parentInstitution: 'Automotive Industry',
    sector: 'Manufacturing',
    source: 'corporate_esd',
    isActive: true
  },

  {
    institution: 'Transnet',
    programName: 'Godisa Supplier Development Fund - Edge Action',
    slug: '',
    fundingType: 'Loan',
    purpose: 'Capital expenditure and working capital for investment-ready Transnet suppliers in rail manufacturing and freight logistics',
    minAmount: amountToCents(2000000),
    maxAmount: amountToCents(7000000),
    amountNotes: 'R2 million to R7 million',
    categories: ['Manufacturing', 'Rail', 'Logistics', 'Supply Chain'],
    provinces: [],
    fundedIndustries: ['Rail Manufacturing', 'Freight Logistics', 'Engineering'],
    eligibility: [
      'At least 51% black-owned or 30% black women-owned',
      'Existing or potential Transnet supplier',
      'B-BBEE status Level 1-4',
      'Preserve existing jobs and create new jobs',
      'Sufficient cash flow to service financing',
      'Maintain accurate accounting records'
    ],
    website: null,
    applicationMethod: 'Investment proposal with formal business plan via email or hand-delivery',
    submissionRequirements: [
      'Investment proposal',
      'Formal business plan'
    ],
    fundingCategory: 'Corporate ESD',
    parentInstitution: 'Transnet',
    sector: 'Manufacturing',
    source: 'corporate_esd',
    isActive: true
  },

  {
    institution: 'Transnet',
    programName: 'Godisa Supplier Development Fund - Profit Share Partners',
    slug: '',
    fundingType: 'Loan',
    purpose: 'Short-term capital for Transnet MSMEs/suppliers with valid purchase orders',
    minAmount: amountToCents(250000),
    maxAmount: amountToCents(5000000),
    amountNotes: 'R250,000 to R5 million per transaction',
    categories: ['Manufacturing', 'Rail', 'Supply Chain', 'Working Capital'],
    provinces: [],
    fundedIndustries: ['Rail Manufacturing', 'Freight Logistics', 'Engineering'],
    eligibility: [
      'At least 51% black-owned or 30% black women-owned',
      'Valid purchase order or contract with Transnet',
      'Existing or potential Transnet supplier',
      'B-BBEE status Level 1-4'
    ],
    website: null,
    applicationMethod: 'Investment proposal with formal business plan',
    submissionRequirements: [
      'Valid purchase order',
      'Investment proposal',
      'Formal business plan'
    ],
    fundingCategory: 'Corporate ESD',
    parentInstitution: 'Transnet',
    sector: 'Manufacturing',
    source: 'corporate_esd',
    isActive: true
  },

  {
    institution: 'Volkswagen',
    programName: 'BEE Trust',
    slug: '',
    fundingType: 'Hybrid',
    purpose: 'Largest privately funded transformation fund in SA automotive sector supporting black industrialists',
    minAmount: null,
    maxAmount: null,
    amountNotes: 'Variety of funding types for diverse needs',
    categories: ['Manufacturing', 'Automotive', 'BEE Transformation'],
    provinces: ['Eastern Cape'],
    fundedIndustries: ['Automotive', 'Component Manufacturing'],
    eligibility: [
      '>51% black ownership before or as consequence of funding',
      'Supplier to automotive sector in South Africa, ideally in Eastern Cape',
      'Post-revenue operations or track record of post-revenue operations'
    ],
    applyUrl: 'https://volkswagenbeetrust.co.za/#get-funded',
    contactEmail: 'info@volkswagenbeetrust.co.za',
    website: 'https://volkswagenbeetrust.co.za',
    applicationMethod: 'Online application',
    submissionRequirements: [],
    fundingCategory: 'Corporate ESD',
    parentInstitution: 'Volkswagen',
    sector: 'Manufacturing',
    source: 'corporate_esd',
    isActive: true
  },

  // ========== PETROCHEMICAL & ENERGY ==========
  {
    institution: 'Anglo American',
    programName: 'Zimele - Khula Mining Fund',
    slug: '',
    fundingType: 'Hybrid',
    purpose: 'Grow emerging black-empowered mining companies into commercially bankable enterprises',
    minAmount: null,
    maxAmount: amountToCents(40000000),
    amountNotes: 'Equity and loan finance up to R40 million per project',
    categories: ['Mining', 'Entrepreneurship'],
    provinces: [],
    fundedIndustries: ['Mining'],
    eligibility: [
      'Black-empowered mining companies',
      'Start-up or expansion phase',
      'Commercial viability',
      'Owner\'s equity contribution (minimum 10%)',
      'Owners involved in day-to-day management'
    ],
    contactEmail: 'alugumi.dzebu@angloamerican.com',
    contactPhone: '+27 11 638 3716',
    contactPerson: 'Alugumi Dzebu',
    website: null,
    applicationMethod: 'Contact via email or phone',
    submissionRequirements: [
      'Business plan',
      'Present to local Zimele Hub Manager'
    ],
    fundingCategory: 'Corporate ESD',
    parentInstitution: 'Anglo American',
    sector: 'Petrochemical & Energy',
    source: 'corporate_esd',
    isActive: true
  },

  {
    institution: 'Anglo American',
    programName: 'Zimele - Supply Chain Fund',
    slug: '',
    fundingType: 'Hybrid',
    purpose: 'Support black-empowered SMEs in Anglo SA supply chain',
    minAmount: null,
    maxAmount: amountToCents(5000000),
    amountNotes: 'Equity and loan finance up to R5 million per project',
    categories: ['Supply Chain', 'BEE'],
    provinces: [],
    fundedIndustries: ['All sectors'],
    eligibility: [
      'Black-empowered small or medium-sized businesses',
      'Existing or potential link into Anglo supply chain',
      'Commercial viability',
      'Owner\'s equity contribution (minimum 10%)'
    ],
    contactEmail: 'peter.mothudi@angloamerican.com',
    contactPhone: '+27 11 638 5520',
    contactPerson: 'Peter Mothudi',
    website: null,
    applicationMethod: 'Contact via email or phone',
    submissionRequirements: [
      'Business plan',
      'Present to fund representative'
    ],
    fundingCategory: 'Corporate ESD',
    parentInstitution: 'Anglo American',
    sector: 'Petrochemical & Energy',
    source: 'corporate_esd',
    isActive: true
  },

  {
    institution: 'Anglo American',
    programName: 'Zimele - Community Fund',
    slug: '',
    fundingType: 'Loan',
    purpose: 'Funding, training, and skills development for entrepreneurs in communities where Anglo SA operates',
    minAmount: null,
    maxAmount: amountToCents(2000000),
    amountNotes: 'Loan finance up to R2 million at preferential interest rates',
    categories: ['Community Development', 'Rural Development'],
    provinces: [],
    fundedIndustries: ['All sectors'],
    eligibility: [
      'Small business operating within 50km of Anglo American operation',
      'Labour-sending area or small business hub location',
      'At least 26% owned by historically disadvantaged South African'
    ],
    contactEmail: 'louwrens.dejager@angloamerican.com',
    contactPhone: '+27 11 638 2749',
    contactPerson: 'Louwrens de Jager',
    website: null,
    applicationMethod: 'Contact via email or phone',
    submissionRequirements: [
      'Business plan',
      'Present to local Hub Manager'
    ],
    fundingCategory: 'Corporate ESD',
    parentInstitution: 'Anglo American',
    sector: 'Petrochemical & Energy',
    source: 'corporate_esd',
    isActive: true
  },

  {
    institution: 'Anglo American',
    programName: 'Zimele - Green Fund',
    slug: '',
    fundingType: 'Hybrid',
    purpose: 'Investment in opportunities that mitigate carbon, reduce energy and water consumption, improve waste management',
    minAmount: null,
    maxAmount: amountToCents(10000000),
    amountNotes: 'Funding up to R10 million per project or business',
    categories: ['Green Economy', 'Sustainability', 'Environmental'],
    provinces: [],
    fundedIndustries: ['Green Technology', 'Renewable Energy', 'Waste Management', 'Water Management'],
    eligibility: [
      'Businesses presenting opportunities to reduce energy and water consumption',
      'Improve management of waste and emissions',
      'Commercial viability'
    ],
    contactEmail: 'teresa.mcneill@angloamerican.com',
    contactPhone: '+27 11 638 4178',
    contactPerson: 'Teresa McNeill',
    website: null,
    applicationMethod: 'Contact via email or phone',
    submissionRequirements: [
      'Business plan',
      'Environmental impact assessment'
    ],
    fundingCategory: 'Corporate ESD',
    parentInstitution: 'Anglo American',
    sector: 'Petrochemical & Energy',
    source: 'corporate_esd',
    isActive: true
  },

  {
    institution: 'Astron Energy',
    programName: 'Development Fund - Growing Emerging Businesses',
    slug: '',
    fundingType: 'Loan',
    purpose: 'Support for new or existing small businesses in fuel and lubricants value chain',
    minAmount: null,
    maxAmount: null,
    amountNotes: 'Preferential rate development loans, 1-5 years',
    categories: ['Energy', 'Retail', 'Supply Chain'],
    provinces: [],
    fundedIndustries: ['Fuel', 'Lubricants', 'LPG', 'Bitumen', 'Retail'],
    eligibility: [
      'Black-owned businesses in refinery by-products and retail sectors',
      'Priority to disadvantaged groups (race, gender, disability, youth, rural)',
      'New or existing businesses in fuel and lubricants value chain'
    ],
    website: null,
    applicationMethod: 'Astron MSME Portal',
    submissionRequirements: [],
    fundingCategory: 'Corporate ESD',
    parentInstitution: 'Astron Energy',
    sector: 'Petrochemical & Energy',
    source: 'corporate_esd',
    isActive: true
  },

  {
    institution: 'Astron Energy',
    programName: 'Development Fund - Small Business Support',
    slug: '',
    fundingType: 'Loan',
    purpose: 'Distress or bridging finance for key small business suppliers and retailers',
    minAmount: null,
    maxAmount: null,
    amountNotes: 'Short-term loans, maximum 1 year',
    categories: ['Energy', 'Retail', 'Distress Finance'],
    provinces: [],
    fundedIndustries: ['Fuel', 'Lubricants', 'Retail'],
    eligibility: [
      'Key small business suppliers and retailers',
      'From disadvantaged groups',
      'Require distress or bridging finance'
    ],
    website: null,
    applicationMethod: 'Astron MSME Portal',
    submissionRequirements: [],
    fundingCategory: 'Corporate ESD',
    parentInstitution: 'Astron Energy',
    sector: 'Petrochemical & Energy',
    source: 'corporate_esd',
    isActive: true
  },

  {
    institution: 'Astron Energy',
    programName: 'Enterprise & Supplier Development',
    slug: '',
    fundingType: 'Loan',
    purpose: 'Enable growth of Black-owned SMEs in fuel and lubricants value chain',
    minAmount: null,
    maxAmount: amountToCents(5000000),
    amountNotes: 'Interest-free loan, 3-5 year term, max R5 million',
    categories: ['Energy', 'Supply Chain', 'BEE'],
    provinces: [],
    fundedIndustries: ['Fuel', 'Lubricants'],
    eligibility: [
      'New or existing South African EME or QSE',
      'In fuel and lubricants value chain',
      'Minimum 51% Black ownership',
      'Annual turnover less than R50 million',
      'Preference to black women-owned or designated groups'
    ],
    website: null,
    applicationMethod: 'Astron MSME Portal - create account and complete business profile (minimum 86%)',
    submissionRequirements: [],
    fundingCategory: 'Corporate ESD',
    parentInstitution: 'Astron Energy',
    sector: 'Petrochemical & Energy',
    source: 'corporate_esd',
    isActive: false,
    deadline: new Date('2023-12-31')
  },

  {
    institution: 'Engen',
    programName: 'Convoy Fund',
    slug: '',
    fundingType: 'Loan',
    purpose: 'Promote B-BBEE and maximize socio-economic development through supply chain transformation',
    minAmount: null,
    maxAmount: null,
    amountNotes: 'Business loans with relaxed requirements',
    categories: ['Energy', 'Supply Chain', 'BEE'],
    provinces: [],
    fundedIndustries: ['Fuel', 'Energy', 'Services'],
    eligibility: [
      'Existing SME with potential business contracts',
      '51% black-owned or black-female owned',
      'Turnover less than R50m per annum',
      'South African citizen',
      'Valid tax clearance certificate',
      'Audited/reviewed historical financial statements'
    ],
    contactEmail: 'convoy@engenoil.com',
    website: null,
    applicationMethod: 'Email application',
    submissionRequirements: [
      'Tax clearance certificate',
      'Audited/reviewed financial statements'
    ],
    fundingCategory: 'Corporate ESD',
    parentInstitution: 'Engen',
    sector: 'Petrochemical & Energy',
    source: 'corporate_esd',
    isActive: true
  },

  {
    institution: 'Exxaro',
    programName: 'ESD Fund',
    slug: '',
    fundingType: 'Hybrid',
    purpose: 'Promote economic transformation by developing entrepreneurs and suppliers, creating competitive markets',
    minAmount: null,
    maxAmount: null,
    amountNotes: 'Asset finance, re-finance, bridging loans, acquisition finance',
    categories: ['Mining', 'Supply Chain', 'Entrepreneurship'],
    provinces: [],
    fundedIndustries: ['Mining', 'Services', 'Manufacturing'],
    eligibility: [
      'Preference given to EMEs and QSEs',
      'Valid B-BBEE certificate or EME/QSE Affidavit',
      'Valid SARS Compliance PIN'
    ],
    applyUrl: 'https://fabric.bpfabric.com/self-registration/search/2ce054c7-7ca7-4fe6-84da-0172797bc0a9/6d553636c4b5ff3beeea6f400a567933',
    website: null,
    applicationMethod: 'Online application portal',
    submissionRequirements: [
      'One-page motivation letter',
      'Quotes for assets/goods',
      'Company Profile',
      'Company Registration Documents',
      'Valid B-BBEE certificate',
      'SARS Compliance PIN',
      'Certified ID copies',
      'List of employees',
      'CVs of directors',
      'Proposed budget',
      '12-month Financial Projections',
      'Audited Financial Statements',
      'Latest 3-month Management Accounts',
      'Latest 3-month Bank Statements',
      'Existing contracts/Offtake agreements'
    ],
    fundingCategory: 'Corporate ESD',
    parentInstitution: 'Exxaro',
    sector: 'Petrochemical & Energy',
    source: 'corporate_esd',
    isActive: true
  },

  {
    institution: 'Goldfields South Deep',
    programName: 'ESD Fund - Edge Action',
    slug: '',
    fundingType: 'Loan',
    purpose: 'Capital expenditure and working capital for investment-ready host community enterprises',
    minAmount: amountToCents(2000000),
    maxAmount: amountToCents(7000000),
    amountNotes: 'R2 million to R7 million',
    categories: ['Mining', 'Community Development'],
    provinces: [],
    fundedIndustries: ['Mining', 'Services', 'Supply Chain'],
    eligibility: [
      'South Deep host community enterprises',
      'At least 2-year track record',
      'Investment ready and qualified'
    ],
    applyUrl: 'https://www.goldfields-southdeep.co.za/working-with-south-deep',
    website: 'https://www.goldfields-southdeep.co.za',
    applicationMethod: 'Through Working with South Deep page',
    submissionRequirements: [],
    fundingCategory: 'Corporate ESD',
    parentInstitution: 'Goldfields',
    sector: 'Petrochemical & Energy',
    source: 'corporate_esd',
    isActive: true
  },

  {
    institution: 'Goldfields South Deep',
    programName: 'ESD Fund - Profit Share Partners',
    slug: '',
    fundingType: 'Loan',
    purpose: 'Short-term capital for MSMEs/suppliers with valid purchase orders',
    minAmount: amountToCents(250000),
    maxAmount: amountToCents(5000000),
    amountNotes: 'R250,000 to R5 million per transaction',
    categories: ['Mining', 'Community Development', 'Working Capital'],
    provinces: [],
    fundedIndustries: ['Mining', 'Services', 'Supply Chain'],
    eligibility: [
      'South Deep host community enterprises',
      'Valid and acceptable purchase orders or contracts'
    ],
    applyUrl: 'https://www.goldfields-southdeep.co.za/working-with-south-deep',
    website: 'https://www.goldfields-southdeep.co.za',
    applicationMethod: 'Through Working with South Deep page',
    submissionRequirements: [
      'Valid purchase order or contract'
    ],
    fundingCategory: 'Corporate ESD',
    parentInstitution: 'Goldfields',
    sector: 'Petrochemical & Energy',
    source: 'corporate_esd',
    isActive: true
  },

  {
    institution: 'Sasol',
    programName: 'Siyakha Trust',
    slug: '',
    fundingType: 'Loan',
    purpose: 'Purchase order funding for Sasol-contracted EMEs and QSEs with valid purchase orders',
    minAmount: amountToCents(250000),
    maxAmount: amountToCents(5000000),
    amountNotes: '0% interest, R250,000 to R5 million',
    categories: ['Petrochemical', 'Supply Chain', 'Purchase Order Finance'],
    provinces: [],
    fundedIndustries: ['Petrochemical', 'Energy', 'Services'],
    eligibility: [
      'At least 51% black owned',
      'Sasol Purchase Orders only (R250,000 - R5 million)',
      'Purchase Order delivery in the future',
      'EME or QSE',
      'Clear credit record (No Adverse reports or Judgments)'
    ],
    contactEmail: 'funding.esd@sasol.com',
    website: null,
    applicationMethod: 'Email application to funding team',
    submissionRequirements: [
      'Fully completed loan application form',
      'Valid Sasol purchase order',
      'Sworn B-BBEE affidavit or certificate',
      'Company registration documents',
      'Shareholder certificates',
      'Tax clearance certificate',
      'AFS or management accounts',
      'ID copy (certified, not older than 3 months)',
      'Quotations from supplier (3 per item)',
      'Proof of company address',
      'Bank confirmation letter with stamp'
    ],
    fundingCategory: 'Corporate ESD',
    parentInstitution: 'Sasol',
    sector: 'Petrochemical & Energy',
    source: 'corporate_esd',
    isActive: true
  },

  // ========== RETAIL ==========
  {
    institution: 'Massmart',
    programName: 'Retail Capital',
    slug: '',
    fundingType: 'Loan',
    purpose: 'Working capital loans for SMEs with flat fee instead of interest, payments linked to turnover',
    minAmount: null,
    maxAmount: amountToCents(5000000),
    amountNotes: 'Up to R5 million, accessible within 24 hours',
    categories: ['Retail', 'Working Capital'],
    provinces: [],
    fundedIndustries: ['Retail', 'Services'],
    eligibility: [
      'R30,000 turnover per month',
      '6+ months of ownership',
      '3+ months trade history'
    ],
    applyUrl: 'https://makro.retailcapital.co.za',
    website: null,
    applicationMethod: 'Online through stores or USSD *134*515#',
    submissionRequirements: [],
    fundingCategory: 'Corporate ESD',
    parentInstitution: 'Massmart',
    sector: 'Retail',
    source: 'corporate_esd',
    isActive: true
  },

  {
    institution: 'Shoprite Group',
    programName: 'CredX',
    slug: '',
    fundingType: 'Loan',
    purpose: 'Supply chain finance through discounted invoicing at affordable rates',
    minAmount: null,
    maxAmount: null,
    amountNotes: '100% of invoice value available, all-inclusive interest rate',
    categories: ['Retail', 'Supply Chain Finance'],
    provinces: [],
    fundedIndustries: ['Retail', 'Supply Chain', 'Manufacturing'],
    eligibility: [
      'SMEs with cash flow constraints',
      'Suppliers to Shoprite Group'
    ],
    website: null,
    applicationMethod: 'Through Demica platform',
    submissionRequirements: [],
    fundingCategory: 'Corporate ESD',
    parentInstitution: 'Shoprite',
    sector: 'Retail',
    source: 'corporate_esd',
    isActive: true
  },

  {
    institution: 'Shoprite Group',
    programName: 'Next Capital',
    slug: '',
    fundingType: 'Hybrid',
    purpose: 'Empower local SMEs with annual turnover R5 million or less through packaging, working capital, and marketing support',
    minAmount: null,
    maxAmount: null,
    amountNotes: 'Packaging and labelling support, working capital, marketing assistance',
    categories: ['Retail', 'Product Development', 'SME Support'],
    provinces: [],
    fundedIndustries: ['Food Production', 'Manufacturing', 'Retail'],
    eligibility: [
      'Small local enterprises',
      'Annual turnover of R5 million or less',
      'One-of-a-kind product to sell'
    ],
    applyUrl: 'https://www.shopriteholdings.co.za/suppliers/supplier-listing-small.html',
    website: 'https://www.shopriteholdings.co.za',
    applicationMethod: 'Online application form',
    submissionRequirements: [
      'Business profile',
      'Proof of annual turnover',
      'B-BBEE certificate',
      'Health & Safety Certificate (if applicable)'
    ],
    fundingCategory: 'Corporate ESD',
    parentInstitution: 'Shoprite',
    sector: 'Retail',
    source: 'corporate_esd',
    isActive: true
  },

  // ========== WOMEN-FOCUSED ==========
  {
    institution: 'Enablis',
    programName: 'Acceleration Fund',
    slug: '',
    fundingType: 'Hybrid',
    purpose: 'Equity and debt instruments for women entrepreneurs in ICT, transport, tourism, agriculture, and services',
    minAmount: null,
    maxAmount: null,
    amountNotes: 'Equity and debt, loan periods no longer than 60 months',
    categories: ['Women Entrepreneurship', 'ICT', 'Agriculture', 'Tourism'],
    provinces: [],
    fundedIndustries: ['ICT', 'Transport', 'Tourism', 'Agriculture', 'Services'],
    eligibility: [
      'Women entrepreneurs',
      'Black entrepreneurs',
      'SA MSMEs accredited by Enablis Entrepreneurial Network',
      'MSMEs needing working capital and/or asset finance'
    ],
    applyUrl: 'http://enablis.org/',
    contactEmail: 'bester@enablis.org',
    contactPhone: '+27 21 422 0690',
    contactPerson: 'Ebenise Bester',
    website: 'http://enablis.org/',
    applicationMethod: 'Complete membership application form',
    submissionRequirements: [],
    fundingCategory: 'Corporate ESD',
    parentInstitution: 'Enablis',
    sector: 'Women Entrepreneurship',
    source: 'corporate_esd',
    isActive: true
  },

  {
    institution: 'WDB Investment Holdings',
    programName: 'Enterprise Development Fund',
    slug: '',
    fundingType: 'Loan',
    purpose: 'Unsecured debt financing for women entrepreneurs in ICT, transport, tourism, agriculture, and services',
    minAmount: null,
    maxAmount: null,
    amountNotes: 'Unsecured debt financing and business development services',
    categories: ['Women Entrepreneurship', 'ICT', 'Agriculture', 'Tourism'],
    provinces: [],
    fundedIndustries: ['ICT', 'Transport', 'Tourism', 'Agriculture', 'Services'],
    eligibility: [
      'Women entrepreneurs',
      'Black entrepreneurs',
      'Start-ups and businesses seeking to expand',
      'MSMEs in target sectors'
    ],
    contactEmail: 'info@wdbtrust.org.za',
    website: null,
    applicationMethod: 'Email for details',
    submissionRequirements: [],
    fundingCategory: 'Corporate ESD',
    parentInstitution: 'WDB Investment Holdings',
    sector: 'Women Entrepreneurship',
    source: 'corporate_esd',
    isActive: true
  },

  // ========== SECTOR AGNOSTIC ==========
  {
    institution: 'Hollywood Foundation',
    programName: 'Enterprise and Supplier Development Programme',
    slug: '',
    fundingType: 'Hybrid',
    purpose: 'Assist black-owned and black women-owned SMMEs to grow and become financially and operationally independent',
    minAmount: null,
    maxAmount: null,
    amountNotes: 'Amounts vary based on needs',
    categories: ['Sector Agnostic', 'BEE', 'Women Entrepreneurship'],
    provinces: [],
    fundedIndustries: ['All sectors'],
    eligibility: [
      'EME/QSE with at least 51% black ownership',
      'Valid B-BBEE certificate/EME or QSE sworn affidavit',
      'Operating for at least one year',
      'Offer services needed in line with industry',
      'Able to provide references and prior contracts',
      'Prove potential to grow',
      'Provide business financials'
    ],
    applyUrl: 'https://hollywoodfoundation.co.za/programmes/enterprise-and-supplier-development/',
    contactEmail: 'bester@enablis.org',
    website: 'https://hollywoodfoundation.co.za',
    applicationMethod: 'Online application',
    submissionRequirements: [
      'B-BBEE certificate or affidavit',
      'Business financials',
      'References and prior contracts'
    ],
    fundingCategory: 'Corporate ESD',
    parentInstitution: 'Hollywood Foundation',
    sector: 'Sector Agnostic',
    source: 'corporate_esd',
    isActive: true
  },

  {
    institution: 'Nesa Capital',
    programName: 'Enterprise Development Fund',
    slug: '',
    fundingType: 'Hybrid',
    purpose: 'Provide working, growth, and expansionary capital to SMEs with propensity to create sustainable jobs',
    minAmount: null,
    maxAmount: null,
    amountNotes: 'Minimum R500,000 per permanent job created',
    categories: ['Sector Agnostic', 'Job Creation', 'Growth Capital'],
    provinces: [],
    fundedIndustries: ['All sectors'],
    eligibility: [
      'At least 51% black ownership',
      'Annual turnover less than R50 million',
      'Primarily resident in South Africa',
      'Minimum 24 months of operation with existing cash flow',
      'Demonstrate creation of at least one permanent job per R500,000',
      '2 years audited financials by SAICA member',
      'Valid tax clearance certificate',
      'Valid B-BBEE certificate or affidavit',
      'Business plan showing capital use for expansion'
    ],
    applyUrl: 'https://www.nesacapital.co.za/wp-content/uploads/2019/09/Nesa-ED-Fund-MSME-Application-From.pdf',
    contactEmail: 'info@nesacapital.co.za',
    contactPhone: '+27 11 326 3903',
    website: 'https://www.nesacapital.co.za',
    applicationMethod: 'Complete application form and submit with supporting documents',
    submissionRequirements: [
      '2 years audited annual financial statements',
      'Valid tax clearance certificate',
      'Valid B-BBEE certificate or affidavit',
      'Business plan demonstrating capital use'
    ],
    fundingCategory: 'Corporate ESD',
    parentInstitution: 'Nesa Capital',
    sector: 'Sector Agnostic',
    source: 'corporate_esd',
    isActive: true
  },
];

// ============================================================================
// SEED FUNCTION
// ============================================================================

export async function seedCorporateESD() {
  console.log('🌱 Starting Corporate ESD funding database seed...');
  console.log('📊 Total programs to seed: ' + corporateESDPrograms.length);

  try {
    // First, delete all existing corporate ESD records
    const deleteResult = await prisma.fundingOpportunity.deleteMany({
      where: {
        source: 'corporate_esd',
      },
    });
    console.log(`🗑️  Cleared ${deleteResult.count} existing Corporate ESD records`);

    let successCount = 0;
    let errorCount = 0;

    // Insert each program
    for (const program of corporateESDPrograms) {
      try {
        // Generate slug if not provided
        const slug = program.slug || generateSlug(program.institution, program.programName);

        // Normalize provinces
        const provinces = normalizeProvinces(program.provinces);

        // Create the funding opportunity
        await prisma.fundingOpportunity.create({
          data: {
            institution: program.institution,
            programName: program.programName,
            slug,
            fundingType: program.fundingType,
            minAmount: program.minAmount || null,
            maxAmount: program.maxAmount || null,
            amountNotes: program.amountNotes,
            categories: program.categories,
            provinces,
            fundedIndustries: program.fundedIndustries,
            eligibility: program.eligibility,
            purpose: program.purpose,
            applyUrl: program.applyUrl || null,
            contactEmail: program.contactEmail || null,
            contactPhone: program.contactPhone || null,
            contactPerson: program.contactPerson || null,
            website: program.website || null,
            applicationMethod: program.applicationMethod || null,
            submissionRequirements: program.submissionRequirements || [],
            fundingCategory: program.fundingCategory,
            parentInstitution: program.parentInstitution,
            sector: program.sector,
            source: program.source,
            isActive: program.isActive !== undefined ? program.isActive : true,
            deadline: program.deadline || null,
            searchableText: buildSearchableText(program),
            contacts: program.contactEmail || program.contactPhone
              ? {
                  email: program.contactEmail || undefined,
                  phone: program.contactPhone || undefined,
                }
              : undefined,
          },
        });

        successCount++;
        console.log(`✅ Added: ${program.institution} - ${program.programName}`);
      } catch (error: any) {
        errorCount++;
        console.error(`❌ Error adding ${program.institution} - ${program.programName}:`, error.message);
      }
    }

    // Print summary
    console.log('\n📈 Corporate ESD Seed Summary:');
    console.log(`   ✅ Successfully added: ${successCount} programs`);
    console.log(`   ❌ Errors: ${errorCount} programs`);
    console.log(`   📊 Total in database: ${successCount} Corporate ESD programs`);
    console.log('\n🎉 Corporate ESD seed completed!');

  } catch (error) {
    console.error('❌ Fatal error during Corporate ESD seed:', error);
    throw error;
  }
}

// Run seed if called directly
if (require.main === module) {
  seedCorporateESD()
    .then(() => {
      console.log('✅ Seed completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seed failed:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
