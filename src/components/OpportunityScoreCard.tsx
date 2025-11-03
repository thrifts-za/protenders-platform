"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Users, Target, AlertTriangle, DollarSign, Brain, Loader2 } from "lucide-react";
import { Tender } from "@/types/tender";
import { getAIOpportunityScore, getAIFinancialIntelligence, getAICompetitorIntelligence } from "@/lib/api";
import { useState, useEffect } from "react";

interface OpportunityScoreCardProps {
  tender: Tender;
}

interface AIOpportunityScore {
  value: number;
  confidence: number;
  factors: string[];
  recommendations: string[];
}

interface AIFinancialData {
  valueEstimate: {
    range: {
      low: number;
      high: number;
    };
  };
  paymentReliability?: {
    score: number;
  };
}

interface AICompetitorData {
  marketConcentration: number;
  frequentWinners: Array<{ name: string; wins: number }>;
}

export default function OpportunityScoreCard({ tender }: OpportunityScoreCardProps) {
  const [aiOpportunityScore, setAiOpportunityScore] = useState<AIOpportunityScore | null>(null);
  const [aiFinancial, setAiFinancial] = useState<AIFinancialData | null>(null);
  const [aiCompetitor, setAiCompetitor] = useState<AICompetitorData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    async function loadAIData() {
      try {
        setIsLoading(true);
        setIsError(false);

        // Load AI data in parallel
        const [opportunityScoreData, financialData, competitorData] = await Promise.all([
          getAIOpportunityScore(tender.id).catch(() => null),
          getAIFinancialIntelligence(tender.id).catch(() => null),
          getAICompetitorIntelligence(tender.id).catch(() => null),
        ]);

        setAiOpportunityScore(opportunityScoreData as AIOpportunityScore | null);
        setAiFinancial(financialData as AIFinancialData | null);
        setAiCompetitor(competitorData as AICompetitorData | null);
      } catch (error) {
        console.error('Failed to load AI intelligence:', error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    }

    loadAIData();
  }, [tender.id]);

  // Format currency for ZAR
  const formatCurrency = (value?: number) => {
    if (!value) return isLoading ? "AI Analyzing..." : "Computing...";
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Use AI data if available
  const estimatedValue = aiFinancial?.valueEstimate
    ? `${formatCurrency(aiFinancial.valueEstimate.range.low)} - ${formatCurrency(aiFinancial.valueEstimate.range.high)}`
    : tender.tender?.value
    ? formatCurrency(tender.tender.value.amount)
    : isLoading ? "AI Analyzing..." : "Computing...";

  const opportunityScore = aiOpportunityScore?.value ?? null;

  const competitionHHI = aiCompetitor?.marketConcentration ?? null;
  const competitionIntensity = competitionHHI !== null
    ? competitionHHI > 0.25 ? "Low" : competitionHHI > 0.15 ? "Medium" : "High"
    : "Unknown";

  const activeCompetitors = aiCompetitor?.frequentWinners?.length ?? 0;

  const paymentReliability = aiFinancial?.paymentReliability?.score ?? null;
  const riskLevel = paymentReliability !== null
    ? paymentReliability >= 80 ? "Low" : paymentReliability >= 60 ? "Medium" : "High"
    : "Unknown";

  // Get buyer awards from tender data (would need to be populated from API)
  const buyerAwards = 0; // This would come from intelligence data
  const growthPotential = buyerAwards > 50 ? "High" : buyerAwards > 20 ? "Medium" : "Low";

  const getWinProbabilityColor = (probability: number) => {
    if (probability >= 70) return "text-green-600";
    if (probability >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case "low": return "text-green-600 bg-green-50";
      case "medium": return "text-yellow-600 bg-yellow-50";
      case "high": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getGrowthColor = (growth: string) => {
    switch (growth.toLowerCase()) {
      case "high": return "text-green-600";
      case "medium": return "text-yellow-600";
      case "low": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {isLoading ? (
            <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
          ) : (
            <Brain className="h-5 w-5 text-blue-600" />
          )}
          AI Opportunity Intelligence
          {isLoading && (
            <Badge variant="secondary" className="ml-2">
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              AI Analyzing
            </Badge>
          )}
          {isError && (
            <Badge variant="destructive" className="ml-2">
              AI Error
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Estimated Contract Value */}
          <div className="bg-white rounded-lg p-3 border">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-gray-600">Est. Value</span>
            </div>
            <div className="text-lg font-bold text-green-700">{estimatedValue}</div>
            <div className="text-xs text-gray-500">
              {tender.tender?.mainProcurementCategory ? `${tender.tender.mainProcurementCategory} market avg` : "Based on similar contracts"}
            </div>
          </div>

          {/* Opportunity Score */}
          <div className="bg-white rounded-lg p-3 border">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Opportunity Score</span>
            </div>
            <div className={`text-xl font-bold ${opportunityScore ? getWinProbabilityColor(opportunityScore) : "text-gray-400"}`}>
              {opportunityScore !== null ? `${opportunityScore}%` : "N/A"}
            </div>
            {opportunityScore !== null && <Progress value={opportunityScore} className="h-1 mt-1" />}
          </div>

          {/* Competition Intensity */}
          <div className="bg-white rounded-lg p-3 border">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-gray-600">Competition</span>
            </div>
            <div className="text-lg font-bold text-orange-700">{competitionIntensity}</div>
            <div className="text-xs text-gray-500">
              {activeCompetitors > 0 ? `${activeCompetitors} frequent winners` : "HHI: " + (competitionHHI?.toFixed(2) ?? "N/A")}
            </div>
          </div>

          {/* Growth Potential */}
          <div className="bg-white rounded-lg p-3 border">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-gray-600">Buyer Activity</span>
            </div>
            <div className={`text-lg font-bold ${getGrowthColor(growthPotential)}`}>
              {growthPotential}
            </div>
            <div className="text-xs text-gray-500">
              {buyerAwards > 0 ? `${buyerAwards} awards (24m)` : "No recent awards"}
            </div>
          </div>

          {/* Risk Level */}
          <div className="bg-white rounded-lg p-3 border">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-600">Payment Risk</span>
            </div>
            <Badge className={`${getRiskColor(riskLevel)} border-0`}>
              {riskLevel}
            </Badge>
            <div className="text-xs text-gray-500 mt-1">
              {paymentReliability !== null ? `${paymentReliability}% reliability` : "No data"}
            </div>
          </div>
        </div>

        {/* AI-Powered Quick Insights */}
        <div className="bg-white rounded-lg p-3 border mt-4">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">
              AI-Powered Insights
              {aiOpportunityScore?.confidence && (
                <span className="text-xs text-gray-500 ml-2">
                  (Confidence: {Math.round(aiOpportunityScore.confidence * 100)}%)
                </span>
              )}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {/* AI Factors */}
            {aiOpportunityScore?.factors?.map((factor, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>{factor}</span>
              </div>
            ))}

            {/* AI Recommendations */}
            {aiOpportunityScore?.recommendations?.map((recommendation, index) => (
              <div key={`rec-${index}`} className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-700">{recommendation}</span>
              </div>
            ))}

            {/* Fallback insights */}
            {!aiOpportunityScore && tender.tender?.mainProcurementCategory && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Category: {tender.tender.mainProcurementCategory}</span>
              </div>
            )}
            {!aiOpportunityScore && tender.buyer?.name && buyerAwards > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>{tender.buyer.name} awarded {buyerAwards} contracts (24m)</span>
              </div>
            )}
            {!aiOpportunityScore && tender.tender?.value && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Contract value: {formatCurrency(tender.tender.value.amount)}</span>
              </div>
            )}
            {!aiOpportunityScore && tender.closingAt && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Closes: {new Date(tender.closingAt).toLocaleDateString('en-ZA')}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}