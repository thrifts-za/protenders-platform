/**
 * Funding Match API Route
 * POST /api/funding/match
 *
 * Phase 3: ProTender Fund Finder - Match SMEs to funding opportunities
 * Deterministic scoring algorithm (0-100):
 *   +20 sector match
 *   +15 province match
 *   +15 funding type match
 *   +20 amount range match
 *   +15 eligibility match
 *   +15 purpose match
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface SMEProfile {
  industry?: string; // e.g., "Agriculture", "Manufacturing", "Technology"
  turnover?: number; // Annual turnover in ZAR
  employees?: number; // Number of employees
  beeLevel?: number; // B-BBEE level (1-8)
  province?: string; // e.g., "Gauteng", "Western Cape"
  needs?: string[]; // e.g., ["equipment", "working_capital", "expansion"]
  preferredFundingType?: string; // "Grant", "Loan", "Equity", "Hybrid"
  fundingAmount?: number; // Desired funding amount in ZAR
}

interface MatchResult {
  id: string;
  programName: string;
  institution: string;
  slug: string;
  fundingType: string;
  amountNotes: string | null;
  matchScore: number; // 0-100
  scoreBreakdown: {
    sector: number;
    province: number;
    fundingType: number;
    amountRange: number;
    eligibility: number;
    purpose: number;
  };
  categories: string[];
  provinces: string[];
  purpose: string | null;
  applyUrl: string | null;
  minAmountZAR: number | null;
  maxAmountZAR: number | null;
}

interface MatchResponse {
  items: MatchResult[];
  explanations: string[];
  profile: SMEProfile;
}

/**
 * Calculate match score for a funding opportunity against SME profile
 */
function calculateMatchScore(
  opportunity: any,
  profile: SMEProfile
): { score: number; breakdown: MatchResult['scoreBreakdown']; explanations: string[] } {
  const breakdown = {
    sector: 0,
    province: 0,
    fundingType: 0,
    amountRange: 0,
    eligibility: 0,
    purpose: 0,
  };
  const explanations: string[] = [];

  // 1. Sector/Industry match (+20 points)
  if (profile.industry) {
    const industryLower = profile.industry.toLowerCase();

    // Check if industry matches categories
    const categoryMatch = opportunity.categories.some((cat: string) =>
      cat.toLowerCase().includes(industryLower) || industryLower.includes(cat.toLowerCase())
    );

    // Check if industry matches funded industries
    const fundedIndustryMatch = opportunity.fundedIndustries.some((ind: string) =>
      ind.toLowerCase().includes(industryLower) || industryLower.includes(ind.toLowerCase())
    );

    if (categoryMatch || fundedIndustryMatch) {
      breakdown.sector = 20;
      explanations.push(`✓ Sector match: ${profile.industry} aligns with this program`);
    } else {
      explanations.push(`• No exact sector match, but this program may still be relevant`);
    }
  }

  // 2. Province match (+15 points)
  if (profile.province) {
    const provinceLower = profile.province.toLowerCase();
    const provinceMatch = opportunity.provinces.some((prov: string) =>
      prov.toLowerCase() === provinceLower || prov.toLowerCase().includes(provinceLower)
    );

    if (provinceMatch) {
      breakdown.province = 15;
      explanations.push(`✓ Province match: Available in ${profile.province}`);
    } else if (opportunity.provinces.includes('All Provinces')) {
      breakdown.province = 15;
      explanations.push(`✓ Available nationwide (including ${profile.province})`);
    } else {
      explanations.push(`• Not specifically available in ${profile.province}`);
    }
  }

  // 3. Funding type match (+15 points)
  if (profile.preferredFundingType) {
    const typeLower = profile.preferredFundingType.toLowerCase();
    const oppTypeLower = opportunity.fundingType.toLowerCase();

    if (oppTypeLower === typeLower) {
      breakdown.fundingType = 15;
      explanations.push(`✓ Funding type match: ${opportunity.fundingType}`);
    } else if (oppTypeLower === 'hybrid') {
      // Hybrid matches any preference
      breakdown.fundingType = 10;
      explanations.push(`✓ Hybrid funding (includes ${profile.preferredFundingType} option)`);
    } else {
      explanations.push(`• Different funding type: ${opportunity.fundingType} (you preferred ${profile.preferredFundingType})`);
    }
  }

  // 4. Amount range match (+20 points)
  if (profile.fundingAmount !== undefined && profile.fundingAmount !== null) {
    const amountInCents = BigInt(profile.fundingAmount * 100);

    // Check if requested amount falls within the opportunity's range
    const minAmount = opportunity.minAmount ? BigInt(opportunity.minAmount) : null;
    const maxAmount = opportunity.maxAmount ? BigInt(opportunity.maxAmount) : null;

    if (maxAmount && minAmount) {
      // Both min and max defined
      if (amountInCents >= minAmount && amountInCents <= maxAmount) {
        breakdown.amountRange = 20;
        explanations.push(`✓ Amount match: R${profile.fundingAmount.toLocaleString()} is within range`);
      } else if (amountInCents < minAmount) {
        breakdown.amountRange = 5;
        explanations.push(`• Amount is below minimum (min: R${(Number(minAmount) / 100).toLocaleString()})`);
      } else {
        breakdown.amountRange = 5;
        explanations.push(`• Amount exceeds maximum (max: R${(Number(maxAmount) / 100).toLocaleString()})`);
      }
    } else if (maxAmount) {
      // Only max defined
      if (amountInCents <= maxAmount) {
        breakdown.amountRange = 20;
        explanations.push(`✓ Amount match: R${profile.fundingAmount.toLocaleString()} is within limit`);
      } else {
        breakdown.amountRange = 5;
        explanations.push(`• Amount exceeds maximum (max: R${(Number(maxAmount) / 100).toLocaleString()})`);
      }
    } else if (minAmount) {
      // Only min defined
      if (amountInCents >= minAmount) {
        breakdown.amountRange = 20;
        explanations.push(`✓ Amount match: R${profile.fundingAmount.toLocaleString()} meets minimum`);
      } else {
        breakdown.amountRange = 5;
        explanations.push(`• Amount is below minimum (min: R${(Number(minAmount) / 100).toLocaleString()})`);
      }
    } else {
      // No amount constraints
      breakdown.amountRange = 10;
      explanations.push(`• No specific amount constraints`);
    }
  }

  // 5. Eligibility match (+15 points)
  if (profile.turnover || profile.employees || profile.beeLevel) {
    let eligibilityMatch = false;
    const eligibilityChecks: string[] = [];

    // Check eligibility criteria
    opportunity.eligibility.forEach((criterion: string) => {
      const criterionLower = criterion.toLowerCase();

      // Check turnover-related criteria
      if (profile.turnover && criterionLower.includes('turnover')) {
        eligibilityMatch = true;
        eligibilityChecks.push('turnover');
      }

      // Check employee-related criteria
      if (profile.employees) {
        if (criterionLower.includes('sme') || criterionLower.includes('small') || criterionLower.includes('medium')) {
          // Typical SME has < 200 employees
          if (profile.employees < 200) {
            eligibilityMatch = true;
            eligibilityChecks.push('SME size');
          }
        }
        if (criterionLower.includes('micro') && profile.employees < 10) {
          eligibilityMatch = true;
          eligibilityChecks.push('micro enterprise');
        }
      }

      // Check B-BBEE level
      if (profile.beeLevel && (criterionLower.includes('b-bbee') || criterionLower.includes('black'))) {
        eligibilityMatch = true;
        eligibilityChecks.push('B-BBEE');
      }
    });

    if (eligibilityMatch) {
      breakdown.eligibility = 15;
      explanations.push(`✓ Eligibility match: ${eligibilityChecks.join(', ')}`);
    } else {
      breakdown.eligibility = 5;
      explanations.push(`• General eligibility criteria apply`);
    }
  }

  // 6. Purpose/Needs match (+15 points)
  if (profile.needs && profile.needs.length > 0 && opportunity.purpose) {
    const purposeLower = opportunity.purpose.toLowerCase();
    const needsMatch = profile.needs.some((need) => {
      const needLower = need.toLowerCase();
      return purposeLower.includes(needLower) ||
             needLower.includes('equipment') && purposeLower.includes('capital') ||
             needLower.includes('expansion') && purposeLower.includes('growth') ||
             needLower.includes('working_capital') && purposeLower.includes('finance');
    });

    if (needsMatch) {
      breakdown.purpose = 15;
      explanations.push(`✓ Purpose match: Aligns with your needs (${profile.needs.join(', ')})`);
    } else {
      breakdown.purpose = 5;
      explanations.push(`• Purpose: ${opportunity.purpose.substring(0, 100)}...`);
    }
  }

  const totalScore =
    breakdown.sector +
    breakdown.province +
    breakdown.fundingType +
    breakdown.amountRange +
    breakdown.eligibility +
    breakdown.purpose;

  return { score: totalScore, breakdown, explanations };
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const profile: SMEProfile = await request.json();

    // Validate profile
    if (!profile || Object.keys(profile).length === 0) {
      return NextResponse.json(
        { error: 'SME profile is required' },
        { status: 400 }
      );
    }

    // Fetch all active funding opportunities
    const opportunities = await prisma.fundingOpportunity.findMany({
      where: { isActive: true },
    });

    // Calculate match scores for each opportunity
    const matches: MatchResult[] = [];
    const allExplanations: string[] = [];

    opportunities.forEach((opp) => {
      const { score, breakdown, explanations } = calculateMatchScore(opp, profile);

      matches.push({
        id: opp.id,
        programName: opp.programName,
        institution: opp.institution,
        slug: opp.slug,
        fundingType: opp.fundingType,
        amountNotes: opp.amountNotes,
        matchScore: score,
        scoreBreakdown: breakdown,
        categories: opp.categories,
        provinces: opp.provinces,
        purpose: opp.purpose,
        applyUrl: opp.applyUrl,
        minAmountZAR: opp.minAmount ? Number(opp.minAmount) / 100 : null,
        maxAmountZAR: opp.maxAmount ? Number(opp.maxAmount) / 100 : null,
      });

      // Collect top explanations
      if (score >= 50) {
        allExplanations.push(`${opp.programName} (${score}%): ${explanations[0]}`);
      }
    });

    // Sort by match score descending
    matches.sort((a, b) => b.matchScore - a.matchScore);

    // Take top 20 matches
    const topMatches = matches.slice(0, 20);

    const response: MatchResponse = {
      items: topMatches,
      explanations: allExplanations.slice(0, 10), // Top 10 explanations
      profile,
    };

    const duration = Date.now() - startTime;

    // Add custom headers
    const headers = new Headers();
    headers.set('X-Response-Time', `${duration}ms`);
    headers.set('X-Total-Matches', matches.length.toString());
    headers.set('X-Top-Score', topMatches.length > 0 ? topMatches[0].matchScore.toString() : '0');

    console.log(`✅ Funding match completed in ${duration}ms - ${topMatches.length} top matches found`);

    return NextResponse.json(response, { headers });
  } catch (error) {
    console.error('❌ Error matching funding opportunities:', error);

    return NextResponse.json(
      {
        error: 'Failed to match funding opportunities',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
