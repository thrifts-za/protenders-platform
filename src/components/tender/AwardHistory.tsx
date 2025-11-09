'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, TrendingUp, Building2, DollarSign, Calendar, BarChart3, Target } from "lucide-react";
import { PremiumContent } from '@/components/PremiumContent';
import { WaitingListModal } from '@/components/WaitingListModal';

interface AwardHistoryProps {
  buyerName?: string;
  tenderCategory?: string;
}

export default function AwardHistory({ buyerName, tenderCategory }: AwardHistoryProps) {
  const [showWaitingList, setShowWaitingList] = useState(false);

  const historicalAwards = [
    {
      tender: "Supply of Office Equipment",
      winner: "ABC Supplies Ltd",
      awardValue: "R 2,450,000",
      awardDate: "Aug 2024",
      duration: "12 months",
      bbbeeLevel: "Level 2",
      bidders: 8,
    },
    {
      tender: "ICT Infrastructure Upgrade",
      winner: "TechPro Solutions",
      awardValue: "R 5,200,000",
      awardDate: "Jun 2024",
      duration: "18 months",
      bbbeeLevel: "Level 1",
      bidders: 12,
    },
    {
      tender: "Maintenance Services Contract",
      winner: "BuildRight Contractors",
      awardValue: "R 1,850,000",
      awardDate: "Apr 2024",
      duration: "24 months",
      bbbeeLevel: "Level 3",
      bidders: 6,
    },
    {
      tender: "Security Services Provision",
      winner: "SecureGuard SA",
      awardValue: "R 3,100,000",
      awardDate: "Feb 2024",
      duration: "36 months",
      bbbeeLevel: "Level 2",
      bidders: 15,
    },
  ];

  const buyerStats = {
    totalTenders: 48,
    totalValue: "R 124.5M",
    avgAwardTime: "42 days",
    avgBidders: 9,
    successRate: {
      level1: 35,
      level2: 28,
      level3: 22,
      level4plus: 15,
    },
  };

  const categoryTrends = [
    { category: "Construction & Infrastructure", growth: "+12%", volume: 24, avgValue: "R 4.2M" },
    { category: "ICT & Technology", growth: "+8%", volume: 18, avgValue: "R 3.8M" },
    { category: "Professional Services", growth: "+5%", volume: 15, avgValue: "R 2.1M" },
    { category: "Goods & Supplies", growth: "-2%", volume: 21, avgValue: "R 1.5M" },
  ];

  const winningFactors = [
    { factor: "BBBEE Level 1-2", impact: "High", percentage: 65 },
    { factor: "Competitive Pricing", impact: "High", percentage: 58 },
    { factor: "Previous Experience", impact: "Medium", percentage: 42 },
    { factor: "Local Content", impact: "Medium", percentage: 38 },
    { factor: "Technical Capacity", impact: "Medium", percentage: 35 },
  ];

  return (
    <>
      <PremiumContent onUpgradeClick={() => setShowWaitingList(true)} blurIntensity="md">
        <div className="space-y-6">
          {/* Demo Badge */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Award History</h3>
        <Badge variant="secondary" className="text-xs">
          <Award className="h-3 w-3 mr-1" />
          Demo Data
        </Badge>
      </div>

      {/* Buyer Overview Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Buyer Track Record
          </CardTitle>
          <CardDescription>Historical procurement data for {buyerName || "this organ of state"}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Total Tenders</p>
              <p className="text-2xl font-bold">{buyerStats.totalTenders}</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">Last 12 months</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Total Value</p>
              <p className="text-2xl font-bold">{buyerStats.totalValue}</p>
              <p className="text-xs text-muted-foreground mt-1">Awarded</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Avg Award Time</p>
              <p className="text-2xl font-bold">{buyerStats.avgAwardTime}</p>
              <p className="text-xs text-muted-foreground mt-1">From closing</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Avg Bidders</p>
              <p className="text-2xl font-bold">{buyerStats.avgBidders}</p>
              <p className="text-xs text-muted-foreground mt-1">Per tender</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* BBBEE Success Rate */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            BBBEE Success Distribution
          </CardTitle>
          <CardDescription>Award success rate by BBBEE level</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { level: "Level 1", rate: buyerStats.successRate.level1, color: "bg-green-500" },
              { level: "Level 2", rate: buyerStats.successRate.level2, color: "bg-blue-500" },
              { level: "Level 3", rate: buyerStats.successRate.level3, color: "bg-yellow-500" },
              { level: "Level 4+", rate: buyerStats.successRate.level4plus, color: "bg-orange-500" },
            ].map((item, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.level}</span>
                  <span className="text-muted-foreground">{item.rate}% success rate</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`${item.color} h-2 rounded-full transition-all`}
                    style={{ width: `${item.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Historical Awards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Recent Awards
          </CardTitle>
          <CardDescription>Similar tenders awarded in the past 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {historicalAwards.map((award, index) => (
              <div
                key={index}
                className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-sm mb-1">{award.tender}</h4>
                    <p className="text-xs text-muted-foreground">Awarded to: {award.winner}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {award.bbbeeLevel}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div>
                    <p className="text-muted-foreground">Award Value</p>
                    <p className="font-semibold">{award.awardValue}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Award Date</p>
                    <p className="font-semibold">{award.awardDate}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Duration</p>
                    <p className="font-semibold">{award.duration}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Bidders</p>
                    <p className="font-semibold">{award.bidders} companies</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Category Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Category Trends
          </CardTitle>
          <CardDescription>Procurement trends across categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {categoryTrends.map((trend, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-sm">{trend.category}</h4>
                    <Badge
                      variant={trend.growth.startsWith('+') ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {trend.growth}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-muted-foreground">Tenders</p>
                      <p className="font-semibold">{trend.volume} last year</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Avg Value</p>
                      <p className="font-semibold">{trend.avgValue}</p>
                    </div>
                  </div>
                </div>
                {trend.growth.startsWith('+') ? (
                  <TrendingUp className="h-5 w-5 text-green-500" />
                ) : (
                  <TrendingUp className="h-5 w-5 text-red-500 rotate-180" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Winning Factors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Key Winning Factors
          </CardTitle>
          <CardDescription>Analysis of successful bid characteristics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {winningFactors.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{item.factor}</span>
                    <Badge
                      variant={item.impact === 'High' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {item.impact} Impact
                    </Badge>
                  </div>
                  <span className="text-sm font-semibold text-primary">{item.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights Summary */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Historical Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>This buyer typically awards tenders within 42 days of closing</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Level 1-2 BBBEE companies have 63% combined success rate</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Average competition: 9 bidders per tender</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Competitive pricing and BBBEE level are primary selection factors</span>
            </p>
          </div>
        </CardContent>
      </Card>
        </div>
      </PremiumContent>

      <WaitingListModal
        isOpen={showWaitingList}
        onClose={() => setShowWaitingList(false)}
        source="award-history"
      />
    </>
  );
}
