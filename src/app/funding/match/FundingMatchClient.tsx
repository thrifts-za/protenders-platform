"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Breadcrumbs from "@/components/Breadcrumbs";
import { FundingCard } from "@/components/FundingCard";
import {
  Target,
  TrendingUp,
  Building2,
  MapPin,
  DollarSign,
  Users,
  Briefcase,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { trackButtonClick, trackFundingMatch } from "@/lib/analytics";

interface SMEProfile {
  industry?: string;
  turnover?: number;
  employees?: number;
  beeLevel?: number;
  province?: string;
  needs?: string[];
  preferredFundingType?: string;
  fundingAmount?: number;
}

interface MatchResult {
  id: string;
  programName: string;
  institution: string;
  slug: string;
  fundingType: string;
  amountNotes: string | null;
  matchScore: number;
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
  fundedIndustries: string[];
  eligibility: string[];
  source: string;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface MatchResponse {
  items: MatchResult[];
  explanations: string[];
  profile: SMEProfile;
}

const SOUTH_AFRICAN_PROVINCES = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "Northern Cape",
  "North West",
  "Western Cape"
];

const INDUSTRIES = [
  "Agriculture",
  "Manufacturing",
  "Technology",
  "ICT",
  "Tourism",
  "Energy",
  "Mining",
  "Petrochemical",
  "Infrastructure",
  "Healthcare",
  "Education",
  "Retail",
  "Construction",
  "Financial Services",
  "Supply Chain",
  "Forestry",
  "FMCG",
  "Hospitality",
  "Other"
];

const FUNDING_TYPES = [
  "Grant",
  "Loan",
  "Equity",
  "Hybrid"
];

const BUSINESS_NEEDS = [
  "equipment",
  "working_capital",
  "expansion",
  "startup_capital",
  "research_development",
  "export_development",
  "skills_training"
];

export default function FundingMatchClient() {
  const [profile, setProfile] = useState<SMEProfile>({
    needs: []
  });
  const [results, setResults] = useState<MatchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Track the match attempt
      trackFundingMatch(
        profile,
        0, // We'll update this after we get results
        0
      );

      const response = await fetch('/api/funding/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        throw new Error('Failed to find matches');
      }

      const data: MatchResponse = await response.json();
      setResults(data);
      setShowForm(false);

      // Track successful match with results
      if (data.items.length > 0) {
        trackFundingMatch(
          profile,
          data.items.length,
          data.items[0].matchScore
        );
      }

      // Scroll to results
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to find matches');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNeedToggle = (need: string) => {
    setProfile(prev => ({
      ...prev,
      needs: prev.needs?.includes(need)
        ? prev.needs.filter(n => n !== need)
        : [...(prev.needs || []), need]
    }));
  };

  const handleReset = () => {
    setProfile({ needs: [] });
    setResults(null);
    setShowForm(true);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="w-full border-b bg-primary/5">
        <div className="content-container py-8">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Funding", href: "/funding" },
              { label: "Find Your Match", href: "/funding/match" },
            ]}
          />
          <div className="mt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-4xl font-bold text-foreground">
                Find Your Funding Match
              </h1>
            </div>
            <p className="text-lg text-muted-foreground">
              Answer a few questions about your business and we'll recommend the best funding programs for you
            </p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Results View */}
        {results && !showForm && (
          <div className="space-y-6">
            {/* Summary Card */}
            <Card className="border-2 border-green-200 bg-green-50/50">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-foreground">Matches Found</h2>
                    </div>
                    <div className="text-lg mb-4 text-muted-foreground">
                      <div>We found <strong className="text-2xl text-foreground">{results.items.length}</strong> funding programs that match your business profile</div>
                      {results.items.length > 0 && (
                        <div className="mt-2 text-base">
                          Best match: <strong className="text-foreground">{results.items[0].programName}</strong>
                          <Badge className="ml-2 bg-green-600 text-white text-sm">{results.items[0].matchScore}% match</Badge>
                        </div>
                      )}
                    </div>

                    {/* Profile Summary */}
                    <div className="flex flex-wrap gap-2">
                      {profile.industry && (
                        <Badge variant="secondary">
                          <Briefcase className="h-3 w-3 mr-1" />
                          {profile.industry}
                        </Badge>
                      )}
                      {profile.province && (
                        <Badge variant="secondary">
                          <MapPin className="h-3 w-3 mr-1" />
                          {profile.province}
                        </Badge>
                      )}
                      {profile.fundingAmount && (
                        <Badge variant="secondary">
                          <DollarSign className="h-3 w-3 mr-1" />
                          R{profile.fundingAmount.toLocaleString()}
                        </Badge>
                      )}
                      {profile.preferredFundingType && (
                        <Badge variant="secondary">
                          {profile.preferredFundingType}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    onClick={handleReset}
                    className="flex-shrink-0"
                  >
                    Modify Search
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Top Explanations */}
            {results.explanations.length > 0 && (
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded-lg">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-foreground">Why These Match Your Profile</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {results.explanations.slice(0, 5).map((explanation, idx) => (
                      <li key={idx} className="text-sm flex items-start gap-3 p-2 bg-background/60 rounded-lg">
                        <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-primary mt-0.5" />
                        <span className="text-foreground">{explanation}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Match Results */}
            {results.items.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <AlertCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No Perfect Matches Found</h3>
                  <p className="text-muted-foreground mb-6">
                    We couldn't find funding programs that match all your criteria, but you can browse all available programs.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button onClick={handleReset} variant="outline">
                      Modify Criteria
                    </Button>
                    <Button asChild>
                      <a href="/funding">Browse All Funding</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div>
                <h2 className="text-2xl font-bold mb-4">Your Recommended Programs</h2>
                <div className="space-y-4">
                  {results.items.map((match) => (
                    <FundingCard
                      key={match.id}
                      funding={match}
                      matchScore={match.matchScore}
                      scoreBreakdown={match.scoreBreakdown}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Form View */}
        {showForm && (
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <Card className="border-2 shadow-xl">
              <CardHeader className="bg-primary/5 rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <span>Tell Us About Your Business</span>
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  The more details you provide, the better we can match you with relevant funding
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Industry */}
                <div className="space-y-2 p-4 bg-primary/5 rounded-lg border">
                  <Label htmlFor="industry" className="flex items-center gap-2 text-base font-semibold">
                    <Briefcase className="h-5 w-5 text-primary" />
                    <span>Industry / Sector</span>
                    <Badge className="bg-primary text-primary-foreground text-xs">Required</Badge>
                  </Label>
                  <Select
                    value={profile.industry}
                    onValueChange={(value) => setProfile(prev => ({ ...prev, industry: value }))}
                  >
                    <SelectTrigger id="industry">
                      <SelectValue placeholder="Select your industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Province */}
                <div className="space-y-2 p-4 bg-primary/5 rounded-lg border">
                  <Label htmlFor="province" className="flex items-center gap-2 text-base font-semibold">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span>Province</span>
                    <Badge className="bg-primary text-primary-foreground text-xs">Required</Badge>
                  </Label>
                  <Select
                    value={profile.province}
                    onValueChange={(value) => setProfile(prev => ({ ...prev, province: value }))}
                  >
                    <SelectTrigger id="province">
                      <SelectValue placeholder="Select your province" />
                    </SelectTrigger>
                    <SelectContent>
                      {SOUTH_AFRICAN_PROVINCES.map((province) => (
                        <SelectItem key={province} value={province}>
                          {province}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Funding Amount */}
                <div className="space-y-2 p-4 bg-primary/5 rounded-lg border">
                  <Label htmlFor="fundingAmount" className="flex items-center gap-2 text-base font-semibold">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <span>Funding Amount Needed (ZAR)</span>
                    <Badge className="bg-primary text-primary-foreground text-xs">Required</Badge>
                  </Label>
                  <Input
                    id="fundingAmount"
                    type="number"
                    placeholder="e.g., 500000"
                    value={profile.fundingAmount || ''}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      fundingAmount: e.target.value ? parseFloat(e.target.value) : undefined
                    }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the amount of funding you need for your business
                  </p>
                </div>

                {/* Preferred Funding Type */}
                <div className="space-y-2">
                  <Label htmlFor="fundingType" className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Preferred Funding Type
                  </Label>
                  <Select
                    value={profile.preferredFundingType}
                    onValueChange={(value) => setProfile(prev => ({ ...prev, preferredFundingType: value }))}
                  >
                    <SelectTrigger id="fundingType">
                      <SelectValue placeholder="Select funding type (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {FUNDING_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Business Needs */}
                <div className="space-y-3 p-4 bg-primary/5 rounded-lg border">
                  <Label className="text-base font-semibold">What do you need funding for?</Label>
                  <div className="flex flex-wrap gap-2">
                    {BUSINESS_NEEDS.map((need) => (
                      <Badge
                        key={need}
                        variant={profile.needs?.includes(need) ? "default" : "outline"}
                        className={`cursor-pointer text-sm py-2 px-3 transition-all ${
                          profile.needs?.includes(need)
                            ? 'scale-105'
                            : 'hover:bg-primary/10'
                        }`}
                        onClick={() => handleNeedToggle(need)}
                      >
                        {need.replace(/_/g, ' ')} {profile.needs?.includes(need) ? '✓' : ''}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Optional Fields - Collapsible */}
                <details className="space-y-4">
                  <summary className="cursor-pointer font-medium text-sm text-muted-foreground hover:text-foreground">
                    Optional: Additional Business Details (for better matching)
                  </summary>

                  <div className="pt-4 space-y-4 pl-4 border-l-2">
                    {/* Annual Turnover */}
                    <div className="space-y-2">
                      <Label htmlFor="turnover" className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Annual Turnover (ZAR)
                      </Label>
                      <Input
                        id="turnover"
                        type="number"
                        placeholder="e.g., 5000000"
                        value={profile.turnover || ''}
                        onChange={(e) => setProfile(prev => ({
                          ...prev,
                          turnover: e.target.value ? parseFloat(e.target.value) : undefined
                        }))}
                      />
                    </div>

                    {/* Number of Employees */}
                    <div className="space-y-2">
                      <Label htmlFor="employees" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Number of Employees
                      </Label>
                      <Input
                        id="employees"
                        type="number"
                        placeholder="e.g., 15"
                        value={profile.employees || ''}
                        onChange={(e) => setProfile(prev => ({
                          ...prev,
                          employees: e.target.value ? parseInt(e.target.value) : undefined
                        }))}
                      />
                    </div>

                    {/* B-BBEE Level */}
                    <div className="space-y-2">
                      <Label htmlFor="beeLevel">B-BBEE Level</Label>
                      <Select
                        value={profile.beeLevel?.toString()}
                        onValueChange={(value) => setProfile(prev => ({
                          ...prev,
                          beeLevel: value ? parseInt(value) : undefined
                        }))}
                      >
                        <SelectTrigger id="beeLevel">
                          <SelectValue placeholder="Select B-BBEE level (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((level) => (
                            <SelectItem key={level} value={level.toString()}>
                              Level {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </details>

                {/* Submit Button */}
                <div className="pt-6">
                  <Button
                    type="submit"
                    className="w-full shadow-lg hover:shadow-xl transition-all"
                    size="lg"
                    disabled={isLoading}
                    onClick={() => trackButtonClick('find_funding_match', 'funding_match_form')}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        <span className="text-lg">Finding Your Matches...</span>
                      </>
                    ) : (
                      <>
                        <Target className="h-5 w-5 mr-2" />
                        <span className="text-lg">Find My Matches</span>
                      </>
                    )}
                  </Button>
                  <p className="text-sm text-center mt-3 text-muted-foreground">
                    This will analyze <strong className="text-primary">{46} funding programs</strong> to find your best matches
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="mt-6 border-2 bg-primary/5 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg h-fit">
                    <AlertCircle className="h-6 w-6 text-primary flex-shrink-0" />
                  </div>
                  <div className="space-y-3">
                    <p className="font-bold text-lg text-foreground">How Our Matching Algorithm Works:</p>
                    <ul className="space-y-2 text-base text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>We score each program on <strong className="text-foreground">6 criteria</strong>: sector, province, funding type, amount, eligibility, and purpose</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>Programs are ranked by match score (0-100%)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>Higher scores mean <strong className="text-foreground">better alignment</strong> with your needs</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>You can always browse all programs regardless of match score</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>
        )}
      </div>
    </div>
  );
}
