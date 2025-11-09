'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Target, TrendingUp, Award, Building2, BarChart3 } from "lucide-react";
import { PremiumContent } from '@/components/PremiumContent';
import { WaitingListModal } from '@/components/WaitingListModal';

interface CompetitiveAnalysisProps {
  tenderCategory?: string;
  province?: string;
}

export default function CompetitiveAnalysis({ tenderCategory, province }: CompetitiveAnalysisProps) {
  const [showWaitingList, setShowWaitingList] = useState(false);

  const competitors = [
    {
      name: "ABC Construction Ltd",
      wins: 12,
      successRate: 68,
      avgBidValue: "R 2.8M",
      strength: "Infrastructure",
      threat: "High",
    },
    {
      name: "BuildRight Solutions",
      wins: 8,
      successRate: 54,
      avgBidValue: "R 2.2M",
      strength: "Cost Efficiency",
      threat: "Medium",
    },
    {
      name: "ProBuild Enterprises",
      wins: 6,
      successRate: 42,
      avgBidValue: "R 3.1M",
      strength: "Quality Standards",
      threat: "Medium",
    },
    {
      name: "Summit Contractors",
      wins: 5,
      successRate: 38,
      avgBidValue: "R 1.9M",
      strength: "Local Presence",
      threat: "Low",
    },
  ];

  const marketInsights = [
    { metric: "Average Bid Competition", value: "7-12 bidders", trend: "up" },
    { metric: "Market Saturation", value: "Medium", trend: "stable" },
    { metric: "Win Rate (Category)", value: "18%", trend: "down" },
    { metric: "Avg. Award Time", value: "45 days", trend: "stable" },
  ];

  const differentiators = [
    {
      factor: "BBBEE Level",
      yourPosition: "Level 2",
      competitive: "Most at Level 3-4",
      advantage: "Strong",
    },
    {
      factor: "Local Content",
      yourPosition: "85%",
      competitive: "Average 72%",
      advantage: "Strong",
    },
    {
      factor: "Past Performance",
      yourPosition: "4 similar projects",
      competitive: "6-8 projects typical",
      advantage: "Moderate",
    },
    {
      factor: "Price Competitiveness",
      yourPosition: "Mid-range",
      competitive: "Varied spectrum",
      advantage: "Neutral",
    },
  ];

  const strategies = [
    {
      strategy: "Emphasize BBBEE Credentials",
      priority: "High",
      impact: "15-20% scoring advantage",
      icon: Award,
    },
    {
      strategy: "Highlight Local Economic Development",
      priority: "High",
      impact: "10-15% preference points",
      icon: Building2,
    },
    {
      strategy: "Competitive Pricing Strategy",
      priority: "Medium",
      impact: "Improve win probability by 8%",
      icon: Target,
    },
    {
      strategy: "Partnership with Local SMME",
      priority: "Medium",
      impact: "5-10% additional points",
      icon: Users,
    },
  ];

  return (
    <>
      <PremiumContent onUpgradeClick={() => setShowWaitingList(true)} blurIntensity="md">
        <div className="space-y-6">
          {/* Demo Badge */}
          <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Competitive Analysis</h3>
        <Badge variant="secondary" className="text-xs">
          <BarChart3 className="h-3 w-3 mr-1" />
          Demo Data
        </Badge>
      </div>

      {/* Market Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Market Intelligence
          </CardTitle>
          <CardDescription>Current market conditions for {tenderCategory || "this category"}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {marketInsights.map((insight, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-1">
                <p className="text-xs text-muted-foreground">{insight.metric}</p>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold">{insight.value}</p>
                  {insight.trend === 'up' && (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  )}
                  {insight.trend === 'down' && (
                    <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
                  )}
                  {insight.trend === 'stable' && (
                    <div className="h-4 w-4 border-t-2 border-yellow-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Competitor Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Likely Competitors
          </CardTitle>
          <CardDescription>Top competitors based on historical tender activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {competitors.map((competitor, index) => (
              <div
                key={index}
                className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{competitor.name}</h4>
                    <p className="text-sm text-muted-foreground">Specializes in {competitor.strength}</p>
                  </div>
                  <Badge
                    variant={
                      competitor.threat === 'High' ? 'destructive' :
                      competitor.threat === 'Medium' ? 'default' : 'secondary'
                    }
                  >
                    {competitor.threat} Threat
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Recent Wins</p>
                    <p className="font-semibold">{competitor.wins} tenders</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Success Rate</p>
                    <p className="font-semibold">{competitor.successRate}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Avg Bid Value</p>
                    <p className="font-semibold">{competitor.avgBidValue}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Your Competitive Position */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Your Competitive Position
          </CardTitle>
          <CardDescription>How you compare to typical competitors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {differentiators.map((diff, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm">{diff.factor}</h4>
                  <Badge
                    variant={
                      diff.advantage === 'Strong' ? 'default' :
                      diff.advantage === 'Moderate' ? 'secondary' : 'outline'
                    }
                  >
                    {diff.advantage}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-primary/5 rounded">
                    <p className="text-muted-foreground mb-1">Your Position</p>
                    <p className="font-semibold">{diff.yourPosition}</p>
                  </div>
                  <div className="p-3 bg-muted rounded">
                    <p className="text-muted-foreground mb-1">Market Average</p>
                    <p className="font-semibold">{diff.competitive}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommended Strategies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Winning Strategies
          </CardTitle>
          <CardDescription>Recommended approaches to outperform competitors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {strategies.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="flex gap-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-sm">{item.strategy}</h4>
                      <Badge variant={item.priority === 'High' ? 'default' : 'secondary'}>
                        {item.priority} Priority
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.impact}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
        </div>
      </PremiumContent>

      <WaitingListModal
        isOpen={showWaitingList}
        onClose={() => setShowWaitingList(false)}
        source="competitive-analysis"
      />
    </>
  );
}
