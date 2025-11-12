import fs from 'fs';
import path from 'path';

/**
 * Parse MSME Funding Handbook PDF and extract funding programs
 * Following the extraction rules from Phase 3 plan
 */

interface FundingProgram {
  institution: string;
  program_name: string;
  category?: string;
  funding_type: string;
  funding_range: string;
  min_amount?: number;
  max_amount?: number;
  funded_industries: string[];
  eligibility: string[];
  purpose: string;
  apply_link: string;
  provinces?: string[];
  contacts?: {
    email?: string;
    phone?: string;
    address?: string;
  };
}

// Normalization mapping from plan document
const categoryKeywords: Record<string, string> = {
  'agro': 'Agriculture',
  'farming': 'Agriculture',
  'agriculture': 'Agriculture',
  'transport': 'Manufacturing',
  'automotive': 'Manufacturing',
  'manufacturing': 'Manufacturing',
  'industrial': 'Manufacturing',
  'green energy': 'Energy',
  'power': 'Energy',
  'energy': 'Energy',
  'renewable': 'Energy',
  'tourism': 'Tourism',
  'hospitality': 'Tourism',
  'ict': 'Technology',
  'digital': 'Technology',
  'innovation': 'Technology',
  'technology': 'Technology',
  'education': 'Skills Development',
  'training': 'Skills Development',
  'skills': 'Skills Development',
  'loan': 'Financial Services',
  'finance': 'Financial Services',
  'property': 'Property Development',
  'housing': 'Property Development',
  'real estate': 'Property Development',
  'infrastructure': 'Infrastructure',
  'construction': 'Infrastructure',
  'mining': 'Mining',
  'mineral': 'Mining',
  'retail': 'Retail & Trade',
  'trade': 'Retail & Trade',
  'franchise': 'Franchise',
  'export': 'Export Development',
  'import': 'Export Development',
};

// Funding type keywords
const fundingTypeKeywords = {
  grant: ['grant', 'incentive', 'rebate', 'subsidy'],
  loan: ['loan', 'credit', 'financing', 'finance'],
  equity: ['equity', 'investment', 'shareholding'],
  hybrid: ['hybrid', 'blended', 'combined'],
};

/**
 * Infer category from text using keyword matching
 */
function inferCategory(text: string): string {
  const lowerText = text.toLowerCase();

  for (const [keyword, category] of Object.entries(categoryKeywords)) {
    if (lowerText.includes(keyword)) {
      return category;
    }
  }

  return 'General Business Development';
}

/**
 * Infer funding type from text
 */
function inferFundingType(text: string): string {
  const lowerText = text.toLowerCase();

  // Check for hybrid first
  if (fundingTypeKeywords.hybrid.some(kw => lowerText.includes(kw))) {
    return 'Hybrid';
  }

  // Check for equity
  if (fundingTypeKeywords.equity.some(kw => lowerText.includes(kw))) {
    return 'Equity';
  }

  // Check for grant
  if (fundingTypeKeywords.grant.some(kw => lowerText.includes(kw))) {
    return 'Grant';
  }

  // Default to loan
  if (fundingTypeKeywords.loan.some(kw => lowerText.includes(kw))) {
    return 'Loan';
  }

  return 'Loan'; // Default
}

/**
 * Parse funding amount from text
 */
function parseFundingAmount(text: string): { min?: number; max?: number } {
  const result: { min?: number; max?: number } = {};

  // Match patterns like "R1 million", "R50,000", "R1.5m", etc.
  const millionPattern = /R\s*(\d+(?:\.\d+)?)\s*million/gi;
  const rangePattern = /R\s*(\d+(?:[,\s]\d+)*(?:\.\d+)?)\s*(?:to|–|-|and)\s*R\s*(\d+(?:[,\s]\d+)*(?:\.\d+)?)/i;
  const singlePattern = /R\s*(\d+(?:[,\s]\d+)*(?:\.\d+)?)/i;

  // Try range pattern first
  const rangeMatch = text.match(rangePattern);
  if (rangeMatch) {
    const minStr = rangeMatch[1].replace(/[,\s]/g, '');
    const maxStr = rangeMatch[2].replace(/[,\s]/g, '');
    result.min = parseFloat(minStr) * 100; // Convert to cents
    result.max = parseFloat(maxStr) * 100;
    return result;
  }

  // Try million pattern
  const millionMatch = text.match(millionPattern);
  if (millionMatch) {
    const amount = parseFloat(millionMatch[1]) * 1000000 * 100; // Convert to cents
    result.max = amount;
    return result;
  }

  // Try single amount pattern
  const singleMatch = text.match(singlePattern);
  if (singleMatch) {
    const amountStr = singleMatch[1].replace(/[,\s]/g, '');
    const amount = parseFloat(amountStr) * 100; // Convert to cents
    result.max = amount;
    return result;
  }

  return result;
}

/**
 * Main parsing function - manually extracted from PDF content
 */
function parseHandbook(): FundingProgram[] {
  const programs: FundingProgram[] = [];

  // IDC - Industrial Development Corporation
  const idcPrograms = [
    {
      institution: 'Industrial Development Corporation (IDC)',
      program_name: 'Agro-Processing & Agriculture Strategic Business Unit (SBU)',
      category: 'Agriculture',
      funding_type: 'Loan',
      funding_range: 'Start-ups: 60% of total funding, Expansions: full expansion if 35% equity',
      funded_industries: ['Agro-processing', 'Value-add manufacturing', 'Agriculture'],
      eligibility: ['New or existing companies within agro-processing', 'B-BBEE acquisition'],
      purpose: 'Promote value-adding agro-processing activities fostering inclusivity',
      apply_link: 'https://www.idc.co.za',
      provinces: ['All Provinces'],
      contacts: {
        email: 'callcentre@idc.co.za',
        phone: '0860 693 888',
        address: '19 Fredman Drive, Sandown, Sandton, 2196'
      }
    },
    {
      institution: 'Industrial Development Corporation (IDC)',
      program_name: 'Automotive & Transport Equipment SBU',
      category: 'Manufacturing',
      funding_type: 'Loan',
      funding_range: 'R1 million – R15 million',
      funded_industries: ['Automotive', 'Transport equipment manufacturing', 'Component manufacturing'],
      eligibility: ['Registered South African business', 'Viable business plan'],
      purpose: 'Support global competitiveness in downstream automotive manufacturing',
      apply_link: 'https://www.idc.co.za',
      provinces: ['All Provinces'],
      contacts: {
        email: 'callcentre@idc.co.za',
        phone: '0860 693 888'
      }
    },
    {
      institution: 'Industrial Development Corporation (IDC)',
      program_name: 'Chemicals & Allied Industries SBU',
      category: 'Manufacturing',
      funding_type: 'Loan',
      funding_range: 'Up to R50 million',
      funded_industries: ['Chemicals', 'Pharmaceuticals', 'Plastics', 'Cosmetics'],
      eligibility: ['Manufacturing entities', 'Local content preference'],
      purpose: 'Support downstream value-added chemicals and allied industries',
      apply_link: 'https://www.idc.co.za',
      provinces: ['All Provinces']
    },
    {
      institution: 'Industrial Development Corporation (IDC)',
      program_name: 'Clothing, Textiles, Leather & Footwear SBU',
      category: 'Manufacturing',
      funding_type: 'Loan',
      funding_range: 'R250,000 – R25 million',
      funded_industries: ['Clothing', 'Textiles', 'Leather goods', 'Footwear'],
      eligibility: ['Registered manufacturers', 'Job creation focus'],
      purpose: 'Revitalize and grow the South African clothing and textile sector',
      apply_link: 'https://www.idc.co.za',
      provinces: ['All Provinces']
    },
    {
      institution: 'Industrial Development Corporation (IDC)',
      program_name: 'Green Industries SBU',
      category: 'Energy',
      funding_type: 'Loan',
      funding_range: 'Up to R100 million',
      funded_industries: ['Renewable energy', 'Green technology', 'Energy efficiency', 'Waste management'],
      eligibility: ['Green technology projects', 'Environmental sustainability'],
      purpose: 'Support transition to low-carbon, resource-efficient economy',
      apply_link: 'https://www.idc.co.za',
      provinces: ['All Provinces']
    },
    {
      institution: 'Industrial Development Corporation (IDC)',
      program_name: 'Mining & Mineral Beneficiation SBU',
      category: 'Mining',
      funding_type: 'Loan',
      funding_range: 'R5 million – R200 million',
      funded_industries: ['Mining', 'Mineral beneficiation', 'Downstream processing'],
      eligibility: ['Mining operations', 'Beneficiation projects'],
      purpose: 'Support value-add mineral beneficiation and mining operations',
      apply_link: 'https://www.idc.co.za',
      provinces: ['All Provinces']
    },
    {
      institution: 'Industrial Development Corporation (IDC)',
      program_name: 'Technology, Media & Telecommunications SBU',
      category: 'Technology',
      funding_type: 'Equity',
      funding_range: 'R500,000 – R50 million',
      funded_industries: ['ICT', 'Media', 'Telecommunications', 'Digital services'],
      eligibility: ['Tech startups', 'Innovation-driven companies'],
      purpose: 'Support growth of technology and innovation-driven enterprises',
      apply_link: 'https://www.idc.co.za',
      provinces: ['All Provinces']
    },
    {
      institution: 'Industrial Development Corporation (IDC)',
      program_name: 'Tourism SBU',
      category: 'Tourism',
      funding_type: 'Loan',
      funding_range: 'R500,000 – R30 million',
      funded_industries: ['Tourism', 'Hospitality', 'Accommodation', 'Tourism infrastructure'],
      eligibility: ['Tourism enterprises', 'Job creation'],
      purpose: 'Develop and expand tourism infrastructure and services',
      apply_link: 'https://www.idc.co.za',
      provinces: ['All Provinces']
    }
  ];

  // The dtic - Department of Trade, Industry and Competition
  const dticPrograms = [
    {
      institution: 'Department of Trade, Industry and Competition (the dtic)',
      program_name: 'Black Industrialists Scheme (BIS)',
      category: 'Manufacturing',
      funding_type: 'Grant',
      funding_range: '30–50% cost-sharing up to R50 million',
      funded_industries: ['Manufacturing', 'Agro-processing', 'Industrial production'],
      eligibility: ['51% black-owned', 'New or existing manufacturers', 'Job creation'],
      purpose: 'Promote industrialisation and transformation through black-owned enterprises',
      apply_link: 'https://www.thedtic.gov.za',
      provinces: ['All Provinces'],
      contacts: {
        email: 'IncentiveManagement@thedtic.gov.za',
        phone: '012 394 1000'
      }
    },
    {
      institution: 'Department of Trade, Industry and Competition (the dtic)',
      program_name: 'Automotive Investment Scheme (AIS)',
      category: 'Manufacturing',
      funding_type: 'Grant',
      funding_range: '20–35% of qualifying investment',
      funded_industries: ['Automotive manufacturing', 'Component suppliers'],
      eligibility: ['Registered automotive manufacturers', 'Minimum investment threshold'],
      purpose: 'Support investment in automotive manufacturing and components',
      apply_link: 'https://www.thedtic.gov.za',
      provinces: ['All Provinces']
    },
    {
      institution: 'Department of Trade, Industry and Competition (the dtic)',
      program_name: 'Capital Projects Feasibility Programme (CPFP)',
      category: 'General Business Development',
      funding_type: 'Grant',
      funding_range: 'Up to R1 million per project',
      funded_industries: ['All manufacturing sectors'],
      eligibility: ['SMEs', 'Feasibility study requirement'],
      purpose: 'Fund feasibility studies for capital-intensive projects',
      apply_link: 'https://www.thedtic.gov.za',
      provinces: ['All Provinces']
    },
    {
      institution: 'Department of Trade, Industry and Competition (the dtic)',
      program_name: 'Clothing and Textiles Competitiveness Programme (CTCP)',
      category: 'Manufacturing',
      funding_type: 'Grant',
      funding_range: '30–50% cost-sharing',
      funded_industries: ['Clothing', 'Textiles', 'Footwear'],
      eligibility: ['Manufacturers in clothing/textile sector'],
      purpose: 'Improve competitiveness of clothing and textile industry',
      apply_link: 'https://www.thedtic.gov.za',
      provinces: ['All Provinces']
    },
    {
      institution: 'Department of Trade, Industry and Competition (the dtic)',
      program_name: 'Export Marketing and Investment Assistance (EMIA)',
      category: 'Export Development',
      funding_type: 'Grant',
      funding_range: 'Up to R350,000 per project',
      funded_industries: ['Exporters across all sectors'],
      eligibility: ['Export-oriented businesses', 'Market development activities'],
      purpose: 'Support market development and export promotion activities',
      apply_link: 'https://www.thedtic.gov.za',
      provinces: ['All Provinces']
    },
    {
      institution: 'Department of Trade, Industry and Competition (the dtic)',
      program_name: 'Manufacturing Investment Programme (MIP)',
      category: 'Manufacturing',
      funding_type: 'Grant',
      funding_range: '30% of qualifying costs, max R30 million',
      funded_industries: ['All manufacturing sectors'],
      eligibility: ['New manufacturing facilities', 'Greenfield investments'],
      purpose: 'Incentivise investment in new manufacturing facilities',
      apply_link: 'https://www.thedtic.gov.za',
      provinces: ['All Provinces']
    },
    {
      institution: 'Department of Trade, Industry and Competition (the dtic)',
      program_name: 'Technology and Human Resources for Industry Programme (THRIP)',
      category: 'Skills Development',
      funding_type: 'Grant',
      funding_range: 'Matching grants for R&D',
      funded_industries: ['Research and Development', 'Technology innovation'],
      eligibility: ['Partnership with research institution', 'R&D focus'],
      purpose: 'Support research and technology development partnerships',
      apply_link: 'https://www.thedtic.gov.za',
      provinces: ['All Provinces']
    }
  ];

  // Land and Agricultural Development Bank (Land Bank)
  const landBankPrograms = [
    {
      institution: 'Land and Agricultural Development Bank (Land Bank)',
      program_name: 'Retail and Intermediate Loan Facility',
      category: 'Agriculture',
      funding_type: 'Loan',
      funding_range: 'R50,000 – R10 million',
      funded_industries: ['Agriculture', 'Farming', 'Agribusiness'],
      eligibility: ['Commercial farmers', 'Smallholder farmers', 'Collateral required'],
      purpose: 'Provide production loans for agricultural activities',
      apply_link: 'https://www.landbank.co.za',
      provinces: ['All Provinces'],
      contacts: {
        phone: '0860 526 322',
        email: 'info@landbank.co.za'
      }
    },
    {
      institution: 'Land and Agricultural Development Bank (Land Bank)',
      program_name: 'Term Loans',
      category: 'Agriculture',
      funding_type: 'Loan',
      funding_range: 'Up to R50 million',
      funded_industries: ['Agriculture', 'Farm infrastructure', 'Equipment'],
      eligibility: ['Established farmers', 'Long-term capital investment'],
      purpose: 'Finance long-term capital investments in agriculture',
      apply_link: 'https://www.landbank.co.za',
      provinces: ['All Provinces']
    },
    {
      institution: 'Land and Agricultural Development Bank (Land Bank)',
      program_name: 'Structured Finance',
      category: 'Agriculture',
      funding_type: 'Loan',
      funding_range: 'R50 million and above',
      funded_industries: ['Large-scale agriculture', 'Agro-processing'],
      eligibility: ['Large commercial operations', 'Detailed financial assessment'],
      purpose: 'Support large-scale agricultural and agro-processing projects',
      apply_link: 'https://www.landbank.co.za',
      provinces: ['All Provinces']
    }
  ];

  // National Empowerment Fund (NEF)
  const nefPrograms = [
    {
      institution: 'National Empowerment Fund (NEF)',
      program_name: 'Strategic Projects Fund',
      category: 'General Business Development',
      funding_type: 'Equity',
      funding_range: 'R10 million – R75 million',
      funded_industries: ['All sectors', 'Strategic investments'],
      eligibility: ['50% black ownership', 'Strategic impact'],
      purpose: 'Support large-scale black empowerment transactions',
      apply_link: 'https://www.nefcorp.co.za',
      provinces: ['All Provinces'],
      contacts: {
        phone: '011 305 8000',
        email: 'info@nefcorp.co.za'
      }
    },
    {
      institution: 'National Empowerment Fund (NEF)',
      program_name: 'uMnotho Fund',
      category: 'General Business Development',
      funding_type: 'Loan',
      funding_range: 'R250,000 – R10 million',
      funded_industries: ['All sectors', 'SME focus'],
      eligibility: ['51% black ownership', 'Established businesses'],
      purpose: 'Provide growth capital for black-owned SMEs',
      apply_link: 'https://www.nefcorp.co.za',
      provinces: ['All Provinces']
    },
    {
      institution: 'National Empowerment Fund (NEF)',
      program_name: 'iMbewu Fund',
      category: 'General Business Development',
      funding_type: 'Loan',
      funding_range: 'R250,000 – R3 million',
      funded_industries: ['Start-ups', 'Early-stage businesses'],
      eligibility: ['51% black ownership', 'Start-up or early stage'],
      purpose: 'Support start-up and early-stage black entrepreneurs',
      apply_link: 'https://www.nefcorp.co.za',
      provinces: ['All Provinces']
    },
    {
      institution: 'National Empowerment Fund (NEF)',
      program_name: 'Rural and Community Development Fund',
      category: 'General Business Development',
      funding_type: 'Loan',
      funding_range: 'R250,000 – R20 million',
      funded_industries: ['Rural enterprises', 'Community projects'],
      eligibility: ['Community-based organizations', 'Rural location'],
      purpose: 'Promote economic development in rural and underdeveloped areas',
      apply_link: 'https://www.nefcorp.co.za',
      provinces: ['All Provinces']
    },
    {
      institution: 'National Empowerment Fund (NEF)',
      program_name: 'Franchise Fund',
      category: 'Franchise',
      funding_type: 'Loan',
      funding_range: 'R250,000 – R10 million',
      funded_industries: ['Franchising', 'Retail'],
      eligibility: ['51% black ownership', 'Accredited franchises'],
      purpose: 'Enable black entrepreneurs to acquire franchises',
      apply_link: 'https://www.nefcorp.co.za',
      provinces: ['All Provinces']
    },
    {
      institution: 'National Empowerment Fund (NEF)',
      program_name: 'Women Empowerment Fund',
      category: 'General Business Development',
      funding_type: 'Loan',
      funding_range: 'R250,000 – R10 million',
      funded_industries: ['All sectors', 'Women-owned businesses'],
      eligibility: ['51% black women ownership', 'Viable business'],
      purpose: 'Support black women entrepreneurs across all sectors',
      apply_link: 'https://www.nefcorp.co.za',
      provinces: ['All Provinces']
    }
  ];

  // Technology Innovation Agency (TIA)
  const tiaPrograms = [
    {
      institution: 'Technology Innovation Agency (TIA)',
      program_name: 'Technology Development Fund',
      category: 'Technology',
      funding_type: 'Grant',
      funding_range: 'Up to R5 million',
      funded_industries: ['Technology', 'Innovation', 'R&D'],
      eligibility: ['Technology ventures', 'Proof of concept required'],
      purpose: 'Support development of new technologies and innovations',
      apply_link: 'https://www.tia.org.za',
      provinces: ['All Provinces'],
      contacts: {
        phone: '012 844 0000',
        email: 'info@tia.org.za'
      }
    },
    {
      institution: 'Technology Innovation Agency (TIA)',
      program_name: 'Seed Fund',
      category: 'Technology',
      funding_type: 'Equity',
      funding_range: 'R500,000 – R5 million',
      funded_industries: ['Tech start-ups', 'Innovation'],
      eligibility: ['Early-stage tech companies', 'Innovative products'],
      purpose: 'Provide seed funding for technology start-ups',
      apply_link: 'https://www.tia.org.za',
      provinces: ['All Provinces']
    },
    {
      institution: 'Technology Innovation Agency (TIA)',
      program_name: 'Technology Localisation Fund',
      category: 'Technology',
      funding_type: 'Grant',
      funding_range: 'Up to R10 million',
      funded_industries: ['Technology transfer', 'Localisation'],
      eligibility: ['Technology localisation projects', 'Local manufacturing'],
      purpose: 'Support localisation of imported technologies',
      apply_link: 'https://www.tia.org.za',
      provinces: ['All Provinces']
    }
  ];

  // National Housing Finance Corporation (NHFC)
  const nhfcPrograms = [
    {
      institution: 'National Housing Finance Corporation (NHFC)',
      program_name: 'Affordable Housing Loan',
      category: 'Property Development',
      funding_type: 'Loan',
      funding_range: 'R1 million – R50 million',
      funded_industries: ['Property development', 'Affordable housing'],
      eligibility: ['Property developers', 'Affordable housing focus'],
      purpose: 'Finance affordable housing development projects',
      apply_link: 'https://www.nhfc.co.za',
      provinces: ['All Provinces'],
      contacts: {
        phone: '011 644 9800',
        email: 'customerservice@nhfc.co.za'
      }
    },
    {
      institution: 'National Housing Finance Corporation (NHFC)',
      program_name: 'Social Housing Loan',
      category: 'Property Development',
      funding_type: 'Loan',
      funding_range: 'R5 million – R100 million',
      funded_industries: ['Social housing', 'Rental housing'],
      eligibility: ['Social housing institutions', 'Rental property developers'],
      purpose: 'Support development of social and rental housing',
      apply_link: 'https://www.nhfc.co.za',
      provinces: ['All Provinces']
    },
    {
      institution: 'National Housing Finance Corporation (NHFC)',
      program_name: 'Incremental Housing Loan',
      category: 'Property Development',
      funding_type: 'Loan',
      funding_range: 'R500,000 – R10 million',
      funded_industries: ['Home improvement', 'Housing upgrades'],
      eligibility: ['Low-income housing projects', 'Incremental development'],
      purpose: 'Finance incremental housing development and improvements',
      apply_link: 'https://www.nhfc.co.za',
      provinces: ['All Provinces']
    }
  ];

  // Small Enterprise Finance Agency (sefa)
  const sefaPrograms = [
    {
      institution: 'Small Enterprise Finance Agency (sefa)',
      program_name: 'Direct Lending - Micro Loans',
      category: 'General Business Development',
      funding_type: 'Loan',
      funding_range: 'Up to R100,000',
      funded_industries: ['All sectors', 'Micro enterprises'],
      eligibility: ['Micro enterprises', 'Turnover below R1 million'],
      purpose: 'Provide credit to micro enterprises',
      apply_link: 'https://www.sefa.org.za',
      provinces: ['All Provinces'],
      contacts: {
        phone: '012 394 9500',
        email: 'info@sefa.org.za'
      }
    },
    {
      institution: 'Small Enterprise Finance Agency (sefa)',
      program_name: 'Direct Lending - Small Loans',
      category: 'General Business Development',
      funding_type: 'Loan',
      funding_range: 'R100,001 – R1 million',
      funded_industries: ['All sectors', 'Small businesses'],
      eligibility: ['Small businesses', 'Turnover R1m – R15m'],
      purpose: 'Support growth of small businesses',
      apply_link: 'https://www.sefa.org.za',
      provinces: ['All Provinces']
    },
    {
      institution: 'Small Enterprise Finance Agency (sefa)',
      program_name: 'Direct Lending - Medium Loans',
      category: 'General Business Development',
      funding_type: 'Loan',
      funding_range: 'R1 million – R5 million',
      funded_industries: ['All sectors', 'Medium enterprises'],
      eligibility: ['Medium enterprises', 'Turnover R15m – R50m'],
      purpose: 'Provide growth capital for medium enterprises',
      apply_link: 'https://www.sefa.org.za',
      provinces: ['All Provinces']
    },
    {
      institution: 'Small Enterprise Finance Agency (sefa)',
      program_name: 'Asset Finance',
      category: 'General Business Development',
      funding_type: 'Loan',
      funding_range: 'R50,000 – R5 million',
      funded_industries: ['All sectors', 'Equipment financing'],
      eligibility: ['Businesses needing equipment', 'Asset-backed lending'],
      purpose: 'Finance acquisition of business equipment and assets',
      apply_link: 'https://www.sefa.org.za',
      provinces: ['All Provinces']
    },
    {
      institution: 'Small Enterprise Finance Agency (sefa)',
      program_name: 'Khula Credit Guarantee',
      category: 'General Business Development',
      funding_type: 'Guarantee',
      funding_range: 'Up to 80% guarantee',
      funded_industries: ['All sectors', 'Credit guarantee'],
      eligibility: ['Businesses lacking collateral', 'Bank approval'],
      purpose: 'Provide credit guarantees to enable access to bank finance',
      apply_link: 'https://www.sefa.org.za',
      provinces: ['All Provinces']
    },
    {
      institution: 'Small Enterprise Finance Agency (sefa)',
      program_name: 'Informal and Micro Enterprise Development Programme',
      category: 'General Business Development',
      funding_type: 'Loan',
      funding_range: 'R1,000 – R50,000',
      funded_industries: ['Informal sector', 'Micro enterprises'],
      eligibility: ['Informal businesses', 'Micro enterprises'],
      purpose: 'Support informal and survivalist enterprises',
      apply_link: 'https://www.sefa.org.za',
      provinces: ['All Provinces']
    }
  ];

  // Small Enterprise Development Agency (seda)
  const sedaPrograms = [
    {
      institution: 'Small Enterprise Development Agency (seda)',
      program_name: 'Business Development Support',
      category: 'Skills Development',
      funding_type: 'Grant',
      funding_range: 'Non-financial support',
      funded_industries: ['All sectors', 'Business advisory'],
      eligibility: ['SMEs', 'Co-operatives'],
      purpose: 'Provide business advisory and support services',
      apply_link: 'https://www.seda.org.za',
      provinces: ['All Provinces'],
      contacts: {
        phone: '0860 103 703',
        email: 'info@seda.org.za'
      }
    },
    {
      institution: 'Small Enterprise Development Agency (seda)',
      program_name: 'Co-operative Support Programme',
      category: 'General Business Development',
      funding_type: 'Grant',
      funding_range: 'Non-financial support',
      funded_industries: ['Co-operatives', 'All sectors'],
      eligibility: ['Registered co-operatives'],
      purpose: 'Support establishment and growth of co-operatives',
      apply_link: 'https://www.seda.org.za',
      provinces: ['All Provinces']
    },
    {
      institution: 'Small Enterprise Development Agency (seda)',
      program_name: 'Technology Transfer and Incubation',
      category: 'Technology',
      funding_type: 'Grant',
      funding_range: 'Non-financial support',
      funded_industries: ['Technology', 'Innovation'],
      eligibility: ['Tech start-ups', 'Innovation-driven enterprises'],
      purpose: 'Provide incubation and technology support',
      apply_link: 'https://www.seda.org.za',
      provinces: ['All Provinces']
    }
  ];

  // Development Bank of Southern Africa (DBSA)
  const dbsaPrograms = [
    {
      institution: 'Development Bank of Southern Africa (DBSA)',
      program_name: 'Infrastructure Financing',
      category: 'Infrastructure',
      funding_type: 'Loan',
      funding_range: 'R10 million and above',
      funded_industries: ['Infrastructure', 'Municipal projects', 'Public works'],
      eligibility: ['Municipalities', 'Public entities', 'Infrastructure projects'],
      purpose: 'Finance infrastructure development projects',
      apply_link: 'https://www.dbsa.org',
      provinces: ['All Provinces'],
      contacts: {
        phone: '011 313 3911',
        email: 'info@dbsa.org'
      }
    },
    {
      institution: 'Development Bank of Southern Africa (DBSA)',
      program_name: 'Development Fund',
      category: 'Infrastructure',
      funding_type: 'Grant',
      funding_range: 'Varies by project',
      funded_industries: ['Development projects', 'Capacity building'],
      eligibility: ['Public sector', 'Development initiatives'],
      purpose: 'Support development and capacity building projects',
      apply_link: 'https://www.dbsa.org',
      provinces: ['All Provinces']
    }
  ];

  // Public Investment Corporation (PIC)
  const picPrograms = [
    {
      institution: 'Public Investment Corporation (PIC)',
      program_name: 'Isivande Women\'s Fund',
      category: 'General Business Development',
      funding_type: 'Equity',
      funding_range: 'R5 million – R75 million',
      funded_industries: ['All sectors', 'Women-owned businesses'],
      eligibility: ['25% women ownership', 'Growth-stage businesses'],
      purpose: 'Support women-owned businesses with growth capital',
      apply_link: 'https://www.pic.gov.za',
      provinces: ['All Provinces'],
      contacts: {
        phone: '012 742 7000',
        email: 'enquiries@pic.gov.za'
      }
    },
    {
      institution: 'Public Investment Corporation (PIC)',
      program_name: 'Pan-African Infrastructure Development Fund (PAIDF)',
      category: 'Infrastructure',
      funding_type: 'Equity',
      funding_range: 'R50 million and above',
      funded_industries: ['Infrastructure', 'Large-scale projects'],
      eligibility: ['Infrastructure development', 'Continental projects'],
      purpose: 'Finance large-scale infrastructure projects in Africa',
      apply_link: 'https://www.pic.gov.za',
      provinces: ['All Provinces']
    }
  ];

  // National Youth Development Agency (NYDA)
  const nydaPrograms = [
    {
      institution: 'National Youth Development Agency (NYDA)',
      program_name: 'Micro-Enterprise Fund',
      category: 'General Business Development',
      funding_type: 'Loan',
      funding_range: 'R1,000 – R100,000',
      funded_industries: ['All sectors', 'Youth enterprises'],
      eligibility: ['Ages 18-35', 'South African citizen'],
      purpose: 'Provide start-up funding for youth entrepreneurs',
      apply_link: 'https://www.nyda.gov.za',
      provinces: ['All Provinces'],
      contacts: {
        phone: '011 277 3600',
        email: 'info@nyda.gov.za'
      }
    },
    {
      institution: 'National Youth Development Agency (NYDA)',
      program_name: 'Job Creation Fund',
      category: 'General Business Development',
      funding_type: 'Grant',
      funding_range: 'Up to R500,000',
      funded_industries: ['All sectors', 'Job creation focus'],
      eligibility: ['Ages 18-35', 'Job creation commitment'],
      purpose: 'Support youth-led job creation initiatives',
      apply_link: 'https://www.nyda.gov.za',
      provinces: ['All Provinces']
    },
    {
      institution: 'National Youth Development Agency (NYDA)',
      program_name: 'Solomon Mahlangu Scholarship Fund',
      category: 'Skills Development',
      funding_type: 'Grant',
      funding_range: 'Full tuition coverage',
      funded_industries: ['Education', 'Skills development'],
      eligibility: ['Ages 18-35', 'Academic merit', 'Financial need'],
      purpose: 'Provide scholarships for tertiary education',
      apply_link: 'https://www.nyda.gov.za',
      provinces: ['All Provinces']
    }
  ];

  // Combine all programs
  programs.push(
    ...idcPrograms,
    ...dticPrograms,
    ...landBankPrograms,
    ...nefPrograms,
    ...tiaPrograms,
    ...nhfcPrograms,
    ...sefaPrograms,
    ...sedaPrograms,
    ...dbsaPrograms,
    ...picPrograms,
    ...nydaPrograms
  );

  // Parse amounts and add metadata
  return programs.map(prog => {
    const amounts = parseFundingAmount(prog.funding_range);
    return {
      ...prog,
      min_amount: amounts.min,
      max_amount: amounts.max,
      category: prog.category || inferCategory(prog.program_name + ' ' + prog.purpose),
      funding_type: inferFundingType(prog.program_name + ' ' + prog.purpose)
    };
  });
}

// Main execution
const programs = parseHandbook();

// Create output directory if it doesn't exist
const outputDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Write to file
const outputPath = path.join(outputDir, 'funding-programs.json');
fs.writeFileSync(outputPath, JSON.stringify(programs, null, 2), 'utf-8');

console.log(`✅ Extracted ${programs.length} funding programs`);
console.log(`📁 Saved to: ${outputPath}`);

// Print summary
const institutionCounts = programs.reduce((acc, prog) => {
  acc[prog.institution] = (acc[prog.institution] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

console.log('\n📊 Programs by Institution:');
Object.entries(institutionCounts)
  .sort((a, b) => b[1] - a[1])
  .forEach(([institution, count]) => {
    console.log(`  ${institution}: ${count} programs`);
  });

const categoryCounts = programs.reduce((acc, prog) => {
  const cat = prog.category || 'Unknown';
  acc[cat] = (acc[cat] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

console.log('\n📂 Programs by Category:');
Object.entries(categoryCounts)
  .sort((a, b) => b[1] - a[1])
  .forEach(([category, count]) => {
    console.log(`  ${category}: ${count} programs`);
  });
